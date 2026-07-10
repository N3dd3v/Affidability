import { type SupabaseClient } from "@supabase/supabase-js";

type MockError = {
  message: string;
};

export type MockQueryResult<T = unknown> = {
  data: T | null;
  error: MockError | null;
};

export type QueryOperation = {
  method: string;
  args: unknown[];
};

export type QueryState = {
  table: string;
  operations: QueryOperation[];
  insertPayload?: unknown;
};

class MockQueryBuilder<T> implements PromiseLike<MockQueryResult<T>> {
  constructor(
    private readonly result: MockQueryResult<T>,
    private readonly state: QueryState,
  ) {}

  select(...args: unknown[]): this {
    this.state.operations.push({ method: "select", args });
    return this;
  }

  eq(...args: unknown[]): this {
    this.state.operations.push({ method: "eq", args });
    return this;
  }

  order(...args: unknown[]): this {
    this.state.operations.push({ method: "order", args });
    return this;
  }

  or(...args: unknown[]): this {
    this.state.operations.push({ method: "or", args });
    return this;
  }

  in(...args: unknown[]): this {
    this.state.operations.push({ method: "in", args });
    return this;
  }

  insert(payload: unknown): this {
    this.state.insertPayload = payload;
    this.state.operations.push({ method: "insert", args: [payload] });
    return this;
  }

  delete(...args: unknown[]): this {
    this.state.operations.push({ method: "delete", args });
    return this;
  }

  single(...args: unknown[]): this {
    this.state.operations.push({ method: "single", args });
    return this;
  }

  maybeSingle(...args: unknown[]): this {
    this.state.operations.push({ method: "maybeSingle", args });
    return this;
  }

  then<TResult1 = MockQueryResult<T>, TResult2 = never>(
    onfulfilled?:
      | ((value: MockQueryResult<T>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.result).then(onfulfilled, onrejected);
  }
}

export function createSupabaseMock(
  plan: Record<string, MockQueryResult[]>,
): {
  client: Pick<SupabaseClient, "from">;
  states: QueryState[];
} {
  const queues = Object.fromEntries(
    Object.entries(plan).map(([table, results]) => [table, [...results]]),
  ) as Record<string, MockQueryResult[]>;
  const states: QueryState[] = [];

  return {
    client: {
      from(table: string) {
        const nextResult = queues[table]?.shift();

        if (!nextResult) {
          throw new Error(`No mock query result configured for table "${table}".`);
        }

        const state: QueryState = {
          table,
          operations: [],
        };

        states.push(state);

        return new MockQueryBuilder(nextResult, state) as never;
      },
    },
    states,
  };
}
