// Minimal in-memory stand-in for a Cloudflare D1 binding, backed by node:sqlite.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

class Stmt {
  constructor(db, sql, params = []) {
    this.db = db;
    this.sql = sql;
    this.params = params;
  }
  bind(...params) {
    return new Stmt(this.db, this.sql, params);
  }
  _run() {
    const s = this.db.prepare(this.sql);
    if (/^\s*(SELECT|WITH)/i.test(this.sql)) return { results: s.all(...this.params) };
    s.run(...this.params);
    return { results: [] };
  }
  async first() {
    return this._run().results[0] ?? null;
  }
  async all() {
    return this._run();
  }
  async run() {
    return this._run();
  }
}

export function makeD1() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../schema.sql', import.meta.url), 'utf8'));
  return {
    raw: db,
    prepare: (sql) => new Stmt(db, sql),
    async batch(stmts) {
      db.exec('BEGIN');
      try {
        const out = stmts.map((s) => s._run());
        db.exec('COMMIT');
        return out;
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
  };
}
