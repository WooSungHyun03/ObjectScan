// Isolated SQL fixtures test wallet transactions; no model execution or provider payment is claimed.
import { test, expect } from "vitest";
import { Client } from "pg";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
if (existsSync(".env.test.local")) process.loadEnvFile(".env.test.local");
const url = process.env.TEST_DATABASE_URL;
if (url && !["127.0.0.1", "localhost"].includes(new URL(url).hostname))
  throw Error("Local DB only");
test.skipIf(!url)(
  "atomic credit debit, idempotency, recovery, retry reserve, profile denial, and verified-settlement ledger",
  async () => {
    const db = new Client({ connectionString: url });
    await db.connect();
    const admin = createClient(
      process.env.TEST_SUPABASE_URL!,
      process.env.TEST_SERVICE_KEY!,
    );
    const uid = randomUUID(),
      pid = randomUUID(),
      iid = randomUUID(),
      key = randomUUID();
    const u = await admin.auth.admin.createUser({
      id: uid,
      email: `credit-${uid}@objectscan.test`,
      password: randomUUID() + "!",
      email_confirm: true,
    });
    if (u.error) throw u.error;
    try {
      await db.query("begin");
      await db.query(
        "insert into projects(id,owner_id,name,mode,input_image_count) values($1,$2,'credit-fixture','object',1)",
        [pid, uid],
      );
      await db.query(
        "insert into project_images(id,project_id,owner_id,filename,mime,size_bytes,original_path,status,position) values($1,$2,$3,'fixture.jpg','image/jpeg',100,$4,'verified',0)",
        [iid, pid, uid, `${uid}/${pid}/fixture.jpg`],
      );
      await db.query(
        "insert into object_masks(project_id,image_id,owner_id,storage_path,reviewed,foreground_ratio,revision) values($1,$2,$3,'fixture-mask',true,0.5,0)",
        [pid, iid, uid],
      );
      await db.query(
        "update app_config set value='[\"pixal3d\"]' where key='validated_models'",
      );
      await db.query(
        'update app_config set value=\'[{"model":"pixal3d","min_images":1,"max_images":1}]\' where key=\'validated_profiles\'',
      );
      await db.query(
        "insert into generation_credit_rates values('object',1,3,true) on conflict(mode,min_images) do update set credits=3,enabled=true",
      );
      await db.query("insert into credit_wallets values($1,5)", [uid]);
      const run = () =>
        db.query("select (enqueue_job($1,$2,'generation',$3)).*", [
          pid,
          uid,
          key,
        ]);
      const a = (await run()).rows[0];
      expect(a.order_id).toBeNull();
      expect((await run()).rows[0].id).toBe(a.id);
      expect(
        Number(
          (
            await db.query(
              "select balance from credit_wallets where user_id=$1",
              [uid],
            )
          ).rows[0].balance,
        ),
      ).toBe(2);
      await db.query("update jobs set state='failed' where id=$1", [a.id]);
      expect(
        Number(
          (
            await db.query(
              "select balance from credit_wallets where user_id=$1",
              [uid],
            )
          ).rows[0].balance,
        ),
      ).toBe(5);
      await db.query("update jobs set state='failed' where id=$1", [a.id]);
      expect(
        Number(
          (
            await db.query(
              "select balance from credit_wallets where user_id=$1",
              [uid],
            )
          ).rows[0].balance,
        ),
      ).toBe(5);
      await db.query("select retry_job($1,$2)", [a.id, uid]);
      expect(
        Number(
          (
            await db.query(
              "select balance from credit_wallets where user_id=$1",
              [uid],
            )
          ).rows[0].balance,
        ),
      ).toBe(2);
      await db.query("update jobs set state='cancelled' where id=$1", [a.id]);
      expect(
        Number(
          (
            await db.query(
              "select balance from credit_wallets where user_id=$1",
              [uid],
            )
          ).rows[0].balance,
        ),
      ).toBe(5);
      await db.query("update projects set input_image_count=4 where id=$1", [
        pid,
      ]);
      await db.query("savepoint profile");
      await expect(
        db.query("select enqueue_job($1,$2,'generation',$3)", [
          pid,
          uid,
          randomUUID(),
        ]),
      ).rejects.toThrow("INPUT_PROFILE_NOT_VALIDATED");
      await db.query("rollback to savepoint profile");
      const oid = randomUUID();
      await db.query(
        "insert into orders(id,buyer_id,kind,credit_units,amount,idempotency_key) values($1,$2,'credits',20,1000,$3)",
        [oid, uid, randomUUID()],
      );
      await db.query("savepoint amount");
      await expect(
        db.query("select settle_payment($1,'fixture-provider-key',999,true)", [
          oid,
        ]),
      ).rejects.toThrow("AMOUNT_MISMATCH");
      await db.query("rollback to savepoint amount");
      await db.query(
        "select settle_payment($1,'fixture-provider-key',1000,true)",
        [oid],
      );
      await db.query(
        "select settle_payment($1,'fixture-provider-key',1000,true)",
        [oid],
      );
      expect(
        Number(
          (
            await db.query(
              "select balance from credit_wallets where user_id=$1",
              [uid],
            )
          ).rows[0].balance,
        ),
      ).toBe(25);
      expect(
        (
          await db.query(
            "select count(*) from wallet_entries where order_id=$1",
            [oid],
          )
        ).rows[0].count,
      ).toBe("1");
      await db.query("select reserve_credit_refund($1)", [oid]);
      await db.query("select reserve_credit_refund($1)", [oid]);
      expect(
        Number(
          (
            await db.query(
              "select balance from credit_wallets where user_id=$1",
              [uid],
            )
          ).rows[0].balance,
        ),
      ).toBe(5);
      await db.query(
        "select settle_test_refund($1,'fixture-provider-key',1000,'fixture-refund')",
        [oid],
      );
      await db.query(
        "select settle_test_refund($1,'fixture-provider-key',1000,'fixture-refund')",
        [oid],
      );
      expect(
        Number(
          (
            await db.query(
              "select balance from credit_wallets where user_id=$1",
              [uid],
            )
          ).rows[0].balance,
        ),
      ).toBe(5);
      await db.query("set local role authenticated");
      await db.query("select set_config('request.jwt.claim.sub',$1,true)", [
        randomUUID(),
      ]);
      expect(
        (await db.query("select * from credit_wallets where user_id=$1", [uid]))
          .rows,
      ).toHaveLength(0);
    } finally {
      await db.query("rollback");
      await db.end();
      await admin.auth.admin.deleteUser(uid);
    }
  },
);

test.skipIf(!url)(
  "verified trial grant is once-only, globally capped, and never callable by browser role",
  async () => {
    const db = new Client({ connectionString: url });
    await db.connect();
    const admin = createClient(
      process.env.TEST_SUPABASE_URL!,
      process.env.TEST_SERVICE_KEY!,
    );
    const ids = [randomUUID(), randomUUID(), randomUUID()];
    try {
      for (let i = 0; i < ids.length; i++) {
        const r = await admin.auth.admin.createUser({
          id: ids[i],
          email: `trial-${ids[i]}@objectscan.test`,
          password: randomUUID() + "!",
          email_confirm: i !== 2,
        });
        if (r.error) throw r.error;
      }
      await db.query("begin");
      const used = Number(
        (
          await db.query(
            "select count(*) from wallet_entries where kind='trial'",
          )
        ).rows[0].count,
      );
      await db.query(
        "update app_config set value=$1 where key='trial_credits'",
        [JSON.stringify({ enabled: true, credits: 2, max_accounts: used + 1 })],
      );
      expect(
        Number(
          (await db.query("select claim_trial_credits($1) balance", [ids[0]]))
            .rows[0].balance,
        ),
      ).toBe(2);
      expect(
        Number(
          (await db.query("select claim_trial_credits($1) balance", [ids[0]]))
            .rows[0].balance,
        ),
      ).toBe(2);
      for (const [id, error] of [
        [ids[1], "TRIAL_UNAVAILABLE"],
        [ids[2], "AUTH_REQUIRED"],
      ]) {
        await db.query("savepoint deny");
        await expect(
          db.query("select claim_trial_credits($1)", [id]),
        ).rejects.toThrow(error);
        await db.query("rollback to savepoint deny");
      }
      await db.query("savepoint role");
      await db.query("set local role authenticated");
      await expect(
        db.query("select claim_trial_credits($1)", [ids[0]]),
      ).rejects.toThrow("permission denied");
      await db.query("rollback to savepoint role");
    } finally {
      await db.query("rollback");
      await db.end();
      for (const id of ids) await admin.auth.admin.deleteUser(id);
    }
  },
);
