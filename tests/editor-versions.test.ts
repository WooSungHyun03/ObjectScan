import { beforeAll, afterAll, expect, test } from "vitest";
import { Client } from "pg";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
if (existsSync(".env.test.local")) process.loadEnvFile(".env.test.local");
const url = process.env.TEST_DATABASE_URL;
if (url && !["127.0.0.1", "localhost"].includes(new URL(url).hostname))
  throw Error("Local isolated editor tests only");
const db = new Client({ connectionString: url }),
  users = [randomUUID(), randomUUID()],
  project = randomUUID(),
  job = randomUUID(),
  asset = randomUUID();
let admin: ReturnType<typeof createClient>;
beforeAll(async () => {
  if (!url) return;
  await db.connect();
  admin = createClient(
    process.env.TEST_SUPABASE_URL!,
    process.env.TEST_SERVICE_KEY!,
    { auth: { persistSession: false } },
  );
  for (const id of users) {
    const r = await admin.auth.admin.createUser({
      id,
      email: `editor-sql-${id}@objectscan.test`,
      password: `Test-${randomUUID()}!`,
      email_confirm: true,
    });
    if (r.error) throw r.error;
  }
  await db.query(
    "insert into projects(id,owner_id,name,mode) values($1,$2,'editor SQL fixture','object')",
    [project, users[0]],
  );
  await db.query(
    "insert into jobs(id,project_id,owner_id,kind,model,state,project_revision,idempotency_key) values($1,$2,$3,'generation','pixal3d','completed',0,$4)",
    [job, project, users[0], randomUUID()],
  );
  await db.query(
    "insert into artifacts(id,project_id,owner_id,job_id,name,storage_path,quality) values($1,$2,$3,$4,'SQL fixture - not a GPU output','editor-test/no-file','{}')",
    [asset, project, users[0], job],
  );
});
afterAll(async () => {
  if (!url) return;
  await db.query("delete from artifact_versions where artifact_id=$1", [asset]);
  await db.query("delete from audit_logs where actor_id=any($1::uuid[])", [
    users,
  ]);
  await db.query("delete from artifacts where id=$1", [asset]);
  await db.query("delete from job_events where job_id=$1", [job]);
  await db.query("delete from jobs where id=$1", [job]);
  await db.query("delete from projects where id=$1", [project]);
  for (const id of users) await admin.auth.admin.deleteUser(id);
  await db.end();
});
test.skipIf(!url)(
  "version reservations enforce owner, idempotency, service-only execution and private RLS",
  async () => {
    const key = randomUUID();
    const reserve = (owner: string, k = key, size = 100) =>
      db.query(
        "select * from reserve_artifact_version($1,$2,$3,null,$4,$5,$6)",
        [asset, owner, k, size, "[]", "a".repeat(64)],
      );
    await expect(reserve(users[1])).rejects.toThrow(/ASSET_NOT_FOUND/);
    const a = (await reserve(users[0])).rows[0],
      b = (await reserve(users[0])).rows[0];
    expect(a.id).toBe(b.id);
    expect(a.storage_path).toMatch(new RegExp("^" + users[0] + "/"));
    await expect(reserve(users[0], key, 101)).rejects.toThrow(/IDEMPOTENCY/);
    await db.query("begin");
    try {
      await db.query("set local role authenticated");
      await db.query("select set_config('request.jwt.claim.sub',$1,true)", [
        users[1],
      ]);
      expect(
        (
          await db.query(
            "select id from artifact_versions where artifact_id=$1",
            [asset],
          )
        ).rowCount,
      ).toBe(0);
      await expect(
        db.query("select reserve_artifact_version($1,$2,$3,null,100,'[]')", [
          asset,
          users[1],
          randomUUID(),
        ]),
      ).rejects.toThrow(/permission denied/);
    } finally {
      await db.query("rollback");
    }
  },
);
test.skipIf(!url)(
  "new versions are atomic, immutable/idempotent and do not create payments",
  async () => {
    const ids = [];
    for (let i = 0; i < 2; i++)
      ids.push(
        (
          await db.query(
            "select * from reserve_artifact_version($1,$2,$3,null,100,'[]',$4)",
            [asset, users[0], randomUUID(), "a".repeat(64)],
          )
        ).rows[0].id,
      );
    const quality = JSON.stringify({
      triangles: 10,
      uv_count: 30,
      texture_bytes: 50,
    });
    const finish = (id: string) =>
      db.query("select * from finalize_artifact_version($1,$2,100,$3,$4)", [
        id,
        users[0],
        "a".repeat(64),
        quality,
      ]);
    const a = (await finish(ids[0])).rows[0],
      b = (await finish(ids[1])).rows[0];
    expect(b.version_number).toBe(a.version_number + 1);
    expect((await finish(ids[0])).rows[0].version_number).toBe(
      a.version_number,
    );
    expect(
      (
        await db.query("select storage_path from artifacts where id=$1", [
          asset,
        ])
      ).rows[0].storage_path,
    ).toBe("editor-test/no-file");
    expect(
      (
        await db.query(
          "select count(*)::int as n from orders where buyer_id=$1",
          [users[0]],
        )
      ).rows[0].n,
    ).toBe(0);
    await db.query("begin");
    try {
      await db.query("set local role authenticated");
      await db.query("select set_config('request.jwt.claim.sub',$1,true)", [
        users[0],
      ]);
      await expect(
        db.query("update artifact_versions set size_bytes=1 where id=$1", [
          ids[0],
        ]),
      ).rejects.toThrow(/permission denied/);
    } finally {
      await db.query("rollback");
    }
  },
);
