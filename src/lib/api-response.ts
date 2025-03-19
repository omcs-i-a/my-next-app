import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/dto";

/**
 * 成功レスポンスを返す
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
    const response: ApiResponse<T> = {
        success: true,
        data,
    };

    return NextResponse.json(response, { status });
}

/**
 * エラーレスポンスを返す
 */
export function errorResponse(message: string, status = 400): NextResponse {
    const response: ApiResponse = {
        success: false,
        error: message,
    };

    return NextResponse.json(response, { status });
}

/**
 * 認証エラーレスポンスを返す
 */
export function unauthorizedResponse(message = "認証が必要です"): NextResponse {
    return errorResponse(message, 401);
}

/**
 * 権限エラーレスポンスを返す
 */
export function forbiddenResponse(message = "権限がありません"): NextResponse {
    return errorResponse(message, 403);
}

/**
 * 見つからないエラーレスポンスを返す
 */
export function notFoundResponse(message = "リソースが見つかりません"): NextResponse {
    return errorResponse(message, 404);
}

/**
 * バリデーションエラーレスポンスを返す
 */
export function validationErrorResponse(error: ZodError): NextResponse {
    const formattedErrors = error.format();

    const response: ApiResponse = {
        success: false,
        error: "入力内容に誤りがあります",
        validationErrors: formatZodErrors(formattedErrors),
    };

    return NextResponse.json(response, { status: 422 });
}

/**
 * サーバーエラーレスポンスを返す
 */
export function serverErrorResponse(message = "サーバーエラーが発生しました"): NextResponse {
    return errorResponse(message, 500);
}

/**
 * Zodエラーを読みやすい形式に変換
 */
function formatZodErrors(errors: any, path = ""): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};

    for (const key in errors) {
        if (key === "_errors") continue;

        const currentPath = path ? `${path}.${key}` : key;

        if (errors[key]._errors && errors[key]._errors.length > 0) {
            formattedErrors[currentPath] = errors[key]._errors;
        }

        if (typeof errors[key] === "object" && !Array.isArray(errors[key])) {
            const nestedErrors = formatZodErrors(errors[key], currentPath);
            Object.assign(formattedErrors, nestedErrors);
        }
    }

    return formattedErrors;
} 