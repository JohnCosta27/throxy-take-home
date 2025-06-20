import { cn } from "@/lib/utils"

export const Dot = (props: Partial<HTMLSpanElement>) => {
    return <span className={cn(props.className, "w-2 h-2 rounded-full inline-block")}></span>
}
