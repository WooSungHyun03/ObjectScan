import { beforeAll, afterAll, expect, test, vi } from "vitest";
import sharp from "sharp";
import { cleanupUploads } from "../apps/web/src/lib/server/maintenance";
import { Client } from "pg";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
if (existsSync(".env.test.local")) process.loadEnvFile(".env.test.local");
const url = process.env.TEST_DATABASE_URL;
const enabled = Boolean(url);
if (url && !["127.0.0.1", "localhost"].includes(new URL(url).hostname))
  throw Error("Integration tests require isolated loopback database");
const db = new Client({ connectionString: url });
const ids = [randomUUID(), randomUUID()],
  projects = [randomUUID(), randomUUID()],
  jobs = [randomUUID(), randomUUID()];
let admin: ReturnType<typeof createClient>;
beforeAll(async () => {
  if (!enabled) return;
  await db.connect();
  admin = createClient(
    process.env.TEST_SUPABASE_URL!,
    process.env.TEST_SERVICE_KEY!,
    { auth: { persistSession: false } },
  );
  for (let i = 0; i < 2; i++) {
    const { error } = await admin.auth.admin.createUser({
      id: ids[i],
      email: `test-${ids[i]}@objectscan.test`,
      password: `Test-${ids[i]}!`,
      email_confirm: true,
    });
    if (error) throw error;
    await db.query(
      "insert into projects(id,owner_id,name,mode) values($1,$2,$3,$4)",
      [projects[i], ids[i], "isolation-test", i ? "scene" : "object"],
    );
  }
});
afterAll(async () => {
  if (!enabled) return;
  await db.query(
    "update worker_slot set job_id=null,lease_token=null,lease_expires_at=null where job_id=any($1::uuid[])",
    [jobs],
  );
  await db.query("delete from job_events where job_id=any($1::uuid[])", [jobs]);
  await db.query("delete from jobs where owner_id=any($1::uuid[])", [ids]);
  await db.query("delete from payout_events where seller_id=any($1::uuid[])", [
    ids,
  ]);
  await db.query(
    "delete from payout_requests where seller_id=any($1::uuid[])",
    [ids],
  );
  await db.query(
    "delete from seller_balances where seller_id=any($1::uuid[])",
    [ids],
  );
  await db.query("delete from credit_ledger where user_id=any($1::uuid[])", [
    ids,
  ]);
  await db.query("delete from payments where buyer_id=any($1::uuid[])", [ids]);
  await db.query("delete from refunds where buyer_id=any($1::uuid[])", [ids]);
  await db.query("delete from orders where buyer_id=any($1::uuid[])", [ids]);
  await db.query("delete from project_images where owner_id=any($1::uuid[])", [
    ids,
  ]);
  await db.query("delete from projects where owner_id=any($1::uuid[])", [ids]);
  await db.query("delete from audit_logs where actor_id=any($1::uuid[])", [
    ids,
  ]);
  for (const id of ids) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) throw error;
  }
  await db.end();
});
const integration = enabled ? test : test.skip;
integration(
  "upload cleanup removes only expired unverified objects; tombstones reject late finalization",
  async () => {
    const images = [randomUUID(), randomUUID(), randomUUID()];
    const path = (id: string) => `${ids[0]}/${projects[0]}/${id}/original.jpg`;
    const normalized = `${ids[0]}/${projects[0]}/${images[0]}/normalized.jpg`;
    const bytes = await sharp({
      create: { width: 20, height: 20, channels: 3, background: "#678" },
    })
      .jpeg()
      .toBuffer();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.TEST_SUPABASE_URL!);
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.TEST_SUPABASE_KEY!,
    );
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", process.env.TEST_SERVICE_KEY!);
    try {
      for (let i = 0; i < images.length; i++) {
        await db.query(
          "insert into project_images(id,project_id,owner_id,filename,mime,size_bytes,original_path,position,status,created_at) values($1,$2,$3,'cleanup fixture','image/jpeg',$4,$5,$6,$7,$8)",
          [
            images[i],
            projects[0],
            ids[0],
            bytes.length,
            path(images[i]),
            i,
            i === 2 ? "verified" : "pending",
            new Date(Date.now() - (i === 1 ? 0 : 26 * 3600000)),
          ],
        );
        const { error } = await admin.storage
          .from("original-uploads")
          .upload(path(images[i]), bytes, { contentType: "image/jpeg" });
        if (error) throw error;
      }
      const { error } = await admin.storage
        .from("project-files")
        .upload(normalized, bytes, { contentType: "image/jpeg" });
      if (error) throw error;
      expect(await cleanupUploads(ids[0])).toEqual({ deleted: 1 });
      expect(await cleanupUploads(ids[0])).toEqual({ deleted: 0 });
      expect(
        (await admin.storage.from("original-uploads").download(path(images[0])))
          .error,
      ).not.toBeNull();
      expect(
        (await admin.storage.from("project-files").download(normalized)).error,
      ).not.toBeNull();
      for (const id of images.slice(1))
        expect(
          (await admin.storage.from("original-uploads").download(path(id)))
            .error,
        ).toBeNull();
      await expect(
        db.query("select finalize_image($1,$2,20,20,'cleanup-test',$3)", [
          images[0],
          ids[0],
          normalized,
        ]),
      ).rejects.toThrow("IMAGE_EXPIRED");
      expect(
        (
          await db.query(
            "select status,storage_deleted_at from project_images where id=$1",
            [images[0]],
          )
        ).rows[0],
      ).toMatchObject({
        status: "rejected",
        storage_deleted_at: expect.any(Date),
      });
      await db.query("begin");
      try {
        await db.query("set local role authenticated");
        await expect(
          db.query("select claim_upload_cleanup($1,25)", [ids[0]]),
        ).rejects.toThrow(/permission denied/);
      } finally {
        await db.query("rollback");
      }
    } finally {
      vi.unstubAllEnvs();
      await admin.storage.from("original-uploads").remove(images.map(path));
      await admin.storage.from("project-files").remove([normalized]);
      await db.query("delete from project_images where id=any($1::uuid[])", [
        images,
      ]);
    }
  },
);
integration(
  "RLS: owner sees own project; cannot read another user or elevate role",
  async () => {
    await db.query("begin");
    try {
      await db.query("set local role authenticated");
      await db.query("select set_config('request.jwt.claim.sub',$1,true)", [
        ids[0],
      ]);
      const { rows } = await db.query(
        "select id from projects where id=any($1::uuid[])",
        [projects],
      );
      expect(rows.map((r) => r.id)).toEqual([projects[0]]);
      await expect(
        db.query("update profiles set role='admin' where id=$1", [ids[0]]),
      ).rejects.toThrow(/permission denied/);
    } finally {
      await db.query("rollback");
    }
  },
);
integration(
  "service-only queue and financial RPCs reject authenticated caller",
  async () => {
    await db.query("begin");
    try {
      await db.query("set local role authenticated");
      await expect(
        db.query("select claim_job('browser','[]')"),
      ).rejects.toThrow(/permission denied/);
    } finally {
      await db.query("rollback");
    }
  },
);
integration(
  "concurrent claims share exactly one slot; expiry alone never releases GPU; stale token rejected",
  async () => {
    for (let i = 0; i < 2; i++)
      await db.query(
        "insert into jobs(id,project_id,owner_id,kind,model,project_revision,idempotency_key) values($1,$2,$3,'poses',$4,0,$5)",
        [
          jobs[i],
          projects[i],
          ids[i],
          i ? "gaussian_wrapping" : "pixal3d",
          randomUUID(),
        ],
      );
    const second = new Client({ connectionString: url });
    await second.connect();
    try {
      const claims = await Promise.all([
        db.query("select j.* from claim_job('a','[\"colmap\"]') j"),
        second.query("select j.* from claim_job('b','[\"colmap\"]') j"),
      ]);
      const found = claims.map((r) => r.rows[0]).filter((r) => r.id);
      expect(found).toHaveLength(1);
      const job = found[0];
      expect(
        (
          await db.query("select worker_heartbeat($1,$2) ok", [
            job.id,
            randomUUID(),
          ])
        ).rows[0].ok,
      ).toBe(false);
      await db.query(
        "update worker_slot set lease_expires_at=now()-interval '1 second' where id=1",
      );
      expect(
        (await db.query("select (claim_job('c','[\"colmap\"]')).id id")).rows[0]
          .id,
      ).toBeNull();
      await db.query(
        "update worker_slot set lease_expires_at=now()+interval '120 seconds' where id=1",
      );
      await db.query("update jobs set state='cancelled' where id=$1", [job.id]);
      expect(
        (
          await db.query("select worker_heartbeat($1,$2) ok", [
            job.id,
            job.lease_token,
          ])
        ).rows[0].ok,
      ).toBe(false);
      await db.query("select finish_job($1,$2,'cancelled')", [
        job.id,
        job.lease_token,
      ]);
      expect(
        (await db.query("select job_id from worker_slot where id=1")).rows[0]
          .job_id,
      ).toBeNull();
    } finally {
      await second.end();
    }
  },
);
integration(
  "payment amount mismatch rolls back; duplicate confirmation creates one debit",
  async () => {
    const order = randomUUID();
    await db.query(
      "insert into orders(id,buyer_id,kind,project_id,project_revision,image_count,mode,amount,idempotency_key) values($1,$2,'generation',$3,0,1,'object',1234,$4)",
      [order, ids[0], projects[0], randomUUID()],
    );
    await expect(
      db.query("select settle_payment($1,$2,1233,true)", [
        order,
        "test-payment-" + order,
      ]),
    ).rejects.toThrow("AMOUNT_MISMATCH");
    await db.query("select settle_payment($1,$2,1234,true)", [
      order,
      "test-payment-" + order,
    ]);
    await db.query("select settle_payment($1,$2,1234,true)", [
      order,
      "test-payment-" + order,
    ]);
    expect(
      (
        await db.query(
          "select count(*)::int n,sum(amount)::int total from credit_ledger where order_id=$1",
          [order],
        )
      ).rows[0],
    ).toEqual({ n: 1, total: -1234 });
    expect(
      (
        await db.query(
          "select count(*)::int n from payments where order_id=$1",
          [order],
        )
      ).rows[0].n,
    ).toBe(1);
    expect(
      (
        await db.query(
          "select count(*)::int n from seller_balances where seller_id=$1",
          [ids[0]],
        )
      ).rows[0].n,
    ).toBe(0);
  },
);

integration(
  "payout reservation and rejection preserve balances; non-admin review denied",
  async () => {
    await db.query(
      "insert into seller_balances(seller_id,available) values($1,1000)",
      [ids[1]],
    );
    const r = (
      await db.query("select r.* from request_payout($1,800) r", [ids[1]])
    ).rows[0];
    await expect(
      db.query("select request_payout($1,800)", [ids[1]]),
    ).rejects.toThrow("BALANCE_INSUFFICIENT");
    expect(
      (
        await db.query(
          "select available::int,reserved::int from seller_balances where seller_id=$1",
          [ids[1]],
        )
      ).rows[0],
    ).toEqual({ available: 200, reserved: 800 });
    await expect(
      db.query("select review_payout($1,$2,'approved',null)", [ids[1], r.id]),
    ).rejects.toThrow("ADMIN_REQUIRED");
    await db.query("update profiles set role='admin' where id=$1", [ids[0]]);
    await db.query("select review_payout($1,$2,'approved',null)", [
      ids[0],
      r.id,
    ]);
    await expect(
      db.query("select review_payout($1,$2,'paid',null)", [ids[0], r.id]),
    ).rejects.toThrow("PAYOUT_REFERENCE_REQUIRED");
    await db.query("select review_payout($1,$2,'rejected',null)", [
      ids[0],
      r.id,
    ]);
    await db.query("select review_payout($1,$2,'rejected',null)", [
      ids[0],
      r.id,
    ]);
    expect(
      (
        await db.query(
          "select available::int,reserved::int from seller_balances where seller_id=$1",
          [ids[1]],
        )
      ).rows[0],
    ).toEqual({ available: 1000, reserved: 0 });
    expect(
      (
        await db.query(
          "select count(*)::int n from payout_events where payout_id=$1",
          [r.id],
        )
      ).rows[0].n,
    ).toBe(3);
  },
);

integration(
  "marketplace sandbox grants exactly one purchase entitlement and no withdrawable proceeds",
  async () => {
    const job = randomUUID(),
      asset = randomUUID(),
      listing = randomUUID(),
      order = randomUUID(),
      repurchase = randomUUID();
    await db.query(
      "insert into jobs(id,project_id,owner_id,kind,model,state,project_revision,idempotency_key) values($1,$2,$3,'generation','pixal3d','completed',0,$4)",
      [job, projects[0], ids[0], randomUUID()],
    );
    try {
      await db.query(
        "insert into artifacts(id,project_id,owner_id,job_id,name,storage_path,quality) values($1,$2,$3,$4,'disposable SQL fixture','test-only/no-real-mesh','{}')",
        [asset, projects[0], ids[0], job],
      );
      await db.query(
        "insert into marketplace_listings(id,artifact_id,seller_id,title,description,category,price,status,rights_consent_at) values($1,$2,$3,'test','test','objects',1000,'approved',now())",
        [listing, asset, ids[0]],
      );
      await db.query("begin");
      try {
        await db.query("set local role authenticated");
        await db.query("select set_config('request.jwt.claim.sub',$1,true)", [
          ids[1],
        ]);
        expect(
          (await db.query("select id from artifacts where id=$1", [asset]))
            .rowCount,
        ).toBe(0);
      } finally {
        await db.query("rollback");
      }
      await db.query(
        "insert into orders(id,buyer_id,kind,listing_id,amount,fee,idempotency_key) values($1,$2,'marketplace',$3,1000,100,$4)",
        [order, ids[1], listing, randomUUID()],
      );
      await db.query("select settle_payment($1,$2,1000,true)", [
        order,
        "test-market-" + order,
      ]);
      await db.query("select settle_payment($1,$2,1000,true)", [
        order,
        "test-market-" + order,
      ]);
      expect(
        (
          await db.query(
            "select count(*)::int n from asset_purchases where order_id=$1",
            [order],
          )
        ).rows[0].n,
      ).toBe(1);
      expect(
        (
          await db.query(
            "select sum(amount)::int net from credit_ledger where user_id=$1 and order_id=$2",
            [ids[0], order],
          )
        ).rows[0].net,
      ).toBe(900);
      expect(
        (
          await db.query(
            "select count(*)::int n from seller_balances where seller_id=$1",
            [ids[0]],
          )
        ).rows[0].n,
      ).toBe(0);
      await db.query("begin");
      try {
        await db.query("set local role authenticated");
        await db.query("select set_config('request.jwt.claim.sub',$1,true)", [
          ids[1],
        ]);
        expect(
          (await db.query("select id from artifacts where id=$1", [asset]))
            .rowCount,
        ).toBe(1);
      } finally {
        await db.query("rollback");
      }
      await expect(
        db.query("select settle_test_refund($1,$2,999,$3)", [
          order,
          "test-market-" + order,
          randomUUID(),
        ]),
      ).rejects.toThrow("AMOUNT_MISMATCH");
      await expect(
        db.query("select settle_test_refund($1,$2,1000,$3)", [
          order,
          "wrong-key",
          randomUUID(),
        ]),
      ).rejects.toThrow("TEST_PAYMENT_REQUIRED");
      const refundKey = randomUUID();
      for (let i = 0; i < 2; i++)
        await db.query("select settle_test_refund($1,$2,1000,$3)", [
          order,
          "test-market-" + order,
          refundKey,
        ]);
      expect(
        (
          await db.query(
            "select count(*)::int n from refunds where order_id=$1",
            [order],
          )
        ).rows[0].n,
      ).toBe(1);
      expect(
        (
          await db.query(
            "select sum(amount)::int net from credit_ledger where user_id=$1 and order_id=$2",
            [ids[0], order],
          )
        ).rows[0].net,
      ).toBe(0);
      expect(
        (
          await db.query(
            "select revoked_at from asset_purchases where order_id=$1",
            [order],
          )
        ).rows[0].revoked_at,
      ).not.toBeNull();
      await db.query(
        "insert into orders(id,buyer_id,kind,listing_id,amount,fee,idempotency_key) values($1,$2,'marketplace',$3,1000,100,$4)",
        [repurchase, ids[1], listing, randomUUID()],
      );
      await db.query("select settle_payment($1,$2,1000,true)", [
        repurchase,
        "test-market-" + repurchase,
      ]);
      await db.query("select settle_test_refund($1,$2,1000,$3)", [
        order,
        "test-market-" + order,
        refundKey,
      ]);
      expect(
        (
          await db.query(
            "select order_id,revoked_at from asset_purchases where artifact_id=$1",
            [asset],
          )
        ).rows[0],
      ).toEqual({ order_id: repurchase, revoked_at: null });
    } finally {
      await db.query("delete from asset_purchases where artifact_id=$1", [
        asset,
      ]);
      await db.query(
        "delete from credit_ledger where order_id=any($1::uuid[])",
        [[order, repurchase]],
      );
      await db.query("delete from refunds where order_id=any($1::uuid[])", [
        [order, repurchase],
      ]);
      await db.query("delete from payments where order_id=any($1::uuid[])", [
        [order, repurchase],
      ]);
      await db.query("delete from orders where id=any($1::uuid[])", [
        [order, repurchase],
      ]);
      await db.query("delete from marketplace_listings where id=$1", [listing]);
      await db.query("delete from artifacts where id=$1", [asset]);
      await db.query("delete from jobs where id=$1", [job]);
    }
  },
);

integration(
  "pending uploads reserve their transport maximum and cannot race across projects",
  async () => {
    const other = randomUUID();
    await db.query(
      "insert into projects(id,owner_id,name,mode) values($1,$2,'quota-test','object')",
      [other, ids[0]],
    );
    await db.query(
      "insert into project_images(project_id,owner_id,filename,mime,size_bytes,original_path,position) select $1,$2,'pending','image/jpeg',1,'test-quota/'||gen_random_uuid()::text,n from generate_series(1,63) n",
      [projects[0], ids[0]],
    );
    const second = new Client({ connectionString: url });
    await second.connect();
    try {
      const reserve = (connection: Client, project: string) =>
        connection.query(
          "select reserve_image($1,$2,'small','image/jpeg',1,$3,$4)",
          [project, ids[0], randomUUID(), "test-quota/" + randomUUID()],
        );
      const results = await Promise.allSettled([
        reserve(db, projects[0]),
        reserve(second, other),
      ]);
      expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
      const rejected = results.find((r) => r.status === "rejected");
      expect(
        rejected?.status === "rejected" && String(rejected.reason),
      ).toContain("STORAGE_LIMIT");
      const { rows } = await db.query(
        "select id,file_size_limit::int from storage.buckets where id in ('original-uploads','job-results') order by id",
      );
      expect(rows).toEqual([
        { id: "job-results", file_size_limit: 134217728 },
        { id: "original-uploads", file_size_limit: 16777216 },
      ]);
    } finally {
      await second.end();
      await db.query("delete from project_images where owner_id=$1", [ids[0]]);
      await db.query("delete from projects where id=$1", [other]);
    }
  },
);

integration(
  "heartbeat and completion serialize on the GPU slot without a lock inversion",
  async () => {
    const job = (
      await db.query("select j.* from claim_job('lock-order','[\"colmap\"]') j")
    ).rows[0];
    expect(job.id).toBeTruthy();
    const second = new Client({ connectionString: url });
    await second.connect();
    try {
      await second.query("set statement_timeout='3s'");
      const pid = (await second.query("select pg_backend_pid() pid")).rows[0]
        .pid;
      await db.query("begin");
      await db.query("select id from worker_slot where id=1 for update");
      const finish = second
        .query("select finish_job($1,$2,'failed','WORKER_ERROR')", [
          job.id,
          job.lease_token,
        ])
        .then(
          () => ({ ok: true, error: "" }),
          (e) => ({ ok: false, error: e.message }),
        );
      let blocked = false;
      for (let n = 0; n < 50; n++) {
        if (
          (
            await db.query(
              "select cardinality(pg_blocking_pids($1))>0 blocked",
              [pid],
            )
          ).rows[0].blocked
        ) {
          blocked = true;
          break;
        }
        await new Promise((r) => setTimeout(r, 10));
      }
      expect(blocked).toBe(true);
      expect(
        (
          await db.query("select worker_heartbeat($1,$2) ok", [
            job.id,
            job.lease_token,
          ])
        ).rows[0].ok,
      ).toBe(true);
      await db.query("commit");
      expect(await finish).toEqual({ ok: true, error: "" });
    } finally {
      await db.query("rollback");
      await second.end();
    }
  },
);
