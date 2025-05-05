import type { Metadata } from "next"
import PreLaunchClient from "@/components/pre-launch-client"

export const metadata: Metadata = {
    title: "Coming Soon | Scan&Snack",
    description:
        "Scan&Snack is launching soon! Join our waitlist to be the first to experience the future of restaurant ordering.",
}

export default function PreLaunchPage() {
    return <PreLaunchClient />
}