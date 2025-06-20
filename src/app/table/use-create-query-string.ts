import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export const useCreateQueryString = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    return useCallback(
        (name: string, value: string | undefined) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            const stringParams = params.toString();
            router.push(`${window.location.pathname}?${stringParams}`);
        },
        [searchParams]
    );
}
