import { toast } from "react-toastify";

export const showRequestError = (
    errors?: Record<string, unknown>,
    fallback = "Request failed. Please try again.",
) => {
    const firstError = Object.values(errors ?? {})
        .flatMap((value) => Array.isArray(value) ? value : [value])
        .find((value) => typeof value === "string" && value.trim());

    toast.error(typeof firstError === "string" ? firstError : fallback);
};

export const showRequestException = () => {
    toast.error("Something went wrong. Please try again.");
};

export const showNetworkError = () => {
    toast.error("Unable to connect. Check your internet connection and try again.");
};
