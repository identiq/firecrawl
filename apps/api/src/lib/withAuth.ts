import { AuthResponse } from "../../src/types";
import { logger } from "./logger";
import * as Sentry from "@sentry/node";
import { configDotenv } from "dotenv";
configDotenv();

let warningCount = 0;

export function withAuth<T, U extends any[]>(
  originalFunction: (...args: U) => Promise<T>,
  mockSuccess: T,
) {
  return async function (...args: U): Promise<T> {
    /*
    const [req] = args
    const authHeader =
      req.headers.authorization ??
      (req.headers["sec-websocket-protocol"]
        ? `Bearer ${req.headers["sec-websocket-protocol"]}`
        : null);
    if (!authHeader) {
      return { success: false, error: "Unauthorized", status: 401 } as T;
    }
    const token = authHeader.split(" ")[1]; // Extract the token from "Bearer <token>"
    if (!token) {
      return {
        success: false,
        error: "Unauthorized: Token missing",
        status: 401,
      } as T;
    }

    if (token === process.env.TEST_API_KEY) {
      return { success: true, ...(mockSuccess || {}) } as T;
    }
    

    return { success: false, error: "Unauthorized", status: 401 } as T;
    */

    const useDbAuthentication = process.env.USE_DB_AUTHENTICATION === "true";

    if (!useDbAuthentication) {
      if (warningCount < 5) {
        logger.warn("You're bypassing authentication");
        warningCount++;
      }
      return { success: true, ...(mockSuccess || {}) } as T;
    } else {
      return await originalFunction(...args);
    }
  };
}
