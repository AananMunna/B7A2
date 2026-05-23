import pool from "../../config/db";

export interface CreateIssueInput {
  title: string;
  description: string;
  type: "bug" | "feature_request";
  reporter_id: number;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  type?: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
}

// --------- CREATE ---------
export const createIssue = async (input: CreateIssueInput) => {
  const { title, description, type, reporter_id } = input;

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
    [title, description, type, reporter_id],
  );
  return result.rows[0];
};

// --------- GET ALL ---------
export const getAllIssues = async (
  sort: string = "newest",
  type?: string,
  status?: string,
) => {
  const conditions: string[] = [];
  const values: string[] = [];
  let paramIndex = 1;

  if (type) {
    conditions.push(`type = $${paramIndex}`);
    values.push(type);
    paramIndex++;
  }

  if (status) {
    conditions.push(`status = $${paramIndex}`);
    values.push(status);
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const orderClause = sort === "oldest" ? "ASC" : "DESC";

  const issuesResult = await pool.query(
    `SELECT * FROM issues ${whereClause} ORDER BY created_at ${orderClause}`,
    values,
  );

  const issues = issuesResult.rows;

  if (issues.length === 0) return [];

  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];

  const reportersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1)`,
    [reporterIds],
  );

  const reportersMap: Record<
    number,
    { id: number; name: string; role: string }
  > = {};
  for (const r of reportersResult.rows) {
    reportersMap[r.id] = r;
  }

  return issues.map((issue) => {
    const { reporter_id, ...rest } = issue;
    return {
      ...rest,
      reporter: reportersMap[reporter_id] ?? null,
    };
  });
};

// --------- GET SINGLE ---------
export const getIssueById = async (id: number) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id,
  ]);

  if (issueResult.rows.length === 0) return null;

  const issue = issueResult.rows[0];

  const reporterResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id],
  );

  const { reporter_id, ...rest } = issue;

  return {
    ...rest,
    reporter: reporterResult.rows[0] ?? null,
  };
};

// --------- UPDATE ---------
export const updateIssue = async (id: number, input: UpdateIssueInput) => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.title !== undefined) {
    fields.push(`title = $${paramIndex}`);
    values.push(input.title);
    paramIndex++;
  }
  if (input.description !== undefined) {
    fields.push(`description = $${paramIndex}`);
    values.push(input.description);
    paramIndex++;
  }

  if (input.type !== undefined) {
    fields.push(`type = $${paramIndex}`);
    values.push(input.type);
    paramIndex++;
  }

  if (input.status !== undefined) {
    fields.push(`status = $${paramIndex}`);
    values.push(input.status);
    paramIndex++;
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE issues SET ${fields.join(", ")} WHERE ID = $${paramIndex} RETURNING *`,
    values,
  );
  return result.rows[0];
};

// --------- DELETE ---------
export const deleteIssue = async (id: number) => {
  await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);
};

export const getMetrics = async () => {
  const totalIssues = await pool.query(`SELECT COUNT(*) FROM issues`);
  const totalUsers = await pool.query(`SELECT COUNT(*) FROM users`);

  const byStatus = await pool.query(
    `SELECT status, COUNT(*) as count FROM issues GROUP BY status`,
  );

  const byType = await pool.query(
    `SELECT type, COUNT(*) as count FROM issues GROUP BY type`,
  );

  return {
    total_issues: parseInt(totalIssues.rows[0].count),
    total_users: parseInt(totalUsers.rows[0].count),
    by_status: byStatus.rows,
    by_type: byType.rows,
  };
};
