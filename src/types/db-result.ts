export type DbInsertResult = DbInsertSuccess | DbInsertFailure;
export type DbInsertSuccess = "ok";
export type DbInsertFailure = "duplicated" | "unknown";
