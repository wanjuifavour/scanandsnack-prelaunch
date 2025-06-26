"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { ArrowRight, Smartphone, CreditCard, Utensils, ChevronDown, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

export const addToWaitlist = async (data: { email: string; name: string; restaurantName?: string }) => {
    try {
        const response = await api.post("/auth/wait-list", {
            email: data.email,
            name: data.name,
            restaurantName: data.restaurantName
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const errorMessage = error.response.data.message || "Adding to waitlist failed";
            throw new Error(errorMessage);
        }
        throw new Error("Adding to waitlist failed. Please check your network or try again later.");
    }
}

// Countdown timer component
const CountdownTimer = ({ launchDate }: { launchDate: Date }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    })

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date()
            const difference = launchDate.getTime() - now.getTime()

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                })
            }
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)

        return () => clearInterval(timer)
    }, [launchDate])

    return (
        <div className="flex flex-col items-center">
            <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-md mx-auto">
                {Object.entries(timeLeft).map(([unit, value]) => (
                    <div key={unit} className="flex flex-col items-center">
                        <motion.div
                            className="w-full aspect-square bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center text-2xl md:text-4xl font-bold text-tabletap-purple"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        >
                            {value.toString().padStart(2, "0")}
                        </motion.div>
                        <span className="text-xs md:text-sm mt-2 capitalize">{unit}</span>
                    </div>
                ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Launching at 09:00 EAT (UTC+3)</p>
        </div>
    )
}

// Section component with animation
const AnimatedSection = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })

    return (
        <motion.section
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
            className={cn("py-16 md:py-24", className)}
        >
            {children}
        </motion.section>
    )
}

// Feature card component
const FeatureCard = ({
    icon: Icon,
    title,
    description,
    delay = 0,
}: {
    icon: React.ElementType
    title: string
    description: string
    delay?: number
}) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay, duration: 0.5 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
            <div className="rounded-full bg-tabletap-purple/10 dark:bg-tabletap-purple/20 p-3 w-fit mb-4">
                <Icon className="h-6 w-6 text-tabletap-purple dark:text-tabletap-purple-light" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </motion.div>
    )
}

// Main component
export default function PreLaunchClient() {
    const { scrollYProgress } = useScroll()
    const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.05], [1, 0.95])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [restaurantName, setRestaurantName] = useState("")
    const [subscribed, setSubscribed] = useState(false)

    const launchDate = new Date(Date.UTC(2025, 5, 27, 6, 0, 0));

    const handleWaitlistSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            await addToWaitlist({
                email,
                name,
                restaurantName
            })

            toast.success("You're on the list!", {
                description: "Thank you for joining our waitlist. We'll notify you when we launch.",
            })
            setEmail("")
            setName("")
            setRestaurantName("")
            setSubscribed(true)
        } catch (error) {
            toast.error("Failed to join waitlist", {
                description: error instanceof Error ? error.message : "Please try again later.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Hero Section with Countdown */}
            <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-tabletap-purple/20 via-transparent to-tabletap-orange/20 dark:from-tabletap-purple/10 dark:via-transparent dark:to-tabletap-orange/10" />
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tabletap-purple/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tabletap-orange/50 to-transparent" />
                </div>

                <motion.div className="container mx-auto px-4 pt-32 pb-16 relative z-10 text-center" style={{ opacity, scale }}>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-block mb-6 rounded-full bg-tabletap-purple/10 dark:bg-tabletap-purple/20 px-4 py-1.5 text-sm font-medium text-tabletap-purple dark:text-tabletap-purple-light"
                    >
                        Coming Soon
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 dark:text-white"
                    >
                        The Future of{" "}
                        <span className="text-tabletap-purple dark:text-tabletap-purple-light">Restaurant Ordering</span> is Almost
                        Here
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12"
                    >
                        Scan&Snack is revolutionizing how you order and pay at restaurants. No apps, no waiting, just scan and enjoy.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mb-16"
                    >
                        <h2 className="text-xl md:text-2xl font-semibold mb-8 dark:text-white">Launching In</h2>
                        <CountdownTimer launchDate={launchDate} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="max-w-md mx-auto"
                    >
                        {/* <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Button
                                type="submit"
                                className="bg-tabletap-purple hover:bg-tabletap-purple/90 text-white"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Joining..." : "Join Waitlist"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form> */}
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="absolute bottom-10 left-0 right-0 flex justify-center"
                >
                    <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}>
                        <ChevronDown className="h-8 w-8 text-tabletap-purple dark:text-tabletap-purple-light" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Problem Section */}
            <AnimatedSection className="bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 dark:text-white">The Problem We&apos;re Solving</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Traditional restaurant ordering is full of friction points that frustrate both customers and businesses.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-semibold mb-6 dark:text-white">For Customers</h3>
                            <ul className="space-y-4">
                                {[
                                    "Waiting for servers to take orders and process payments",
                                    "Limited information about menu items and ingredients",
                                    "Difficulty splitting bills among large groups",
                                    "No way to track order status in real-time"
                                ].map((problem, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex items-start"
                                    >
                                        <div className="mr-3 mt-1 text-red-500 dark:text-red-400">
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <p className="dark:text-gray-300">{problem}</p>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-2xl font-semibold mb-6 dark:text-white">For Restaurants</h3>
                            <ul className="space-y-4">
                                {[
                                    "Staff shortages and high turnover rates",
                                    "Order errors and miscommunications",
                                    "Inefficient table turnover and revenue loss",
                                    "High payment processing fees",
                                    "Limited customer data and insights",
                                ].map((problem, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex items-start"
                                    >
                                        <div className="mr-3 mt-1 text-red-500 dark:text-red-400">
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <p className="dark:text-gray-300">{problem}</p>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            {/* Solution Section */}
            <AnimatedSection className="bg-gradient-to-br from-tabletap-purple/5 to-tabletap-orange/5 dark:from-tabletap-purple/10 dark:to-tabletap-orange/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 dark:text-white">Introducing Scan&Snack</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            A seamless QR code ordering and payment system that transforms the dining experience.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Smartphone}
                            title="Scan & Order"
                            description="Customers scan a QR code at their table to instantly view the menu and place orders without waiting for service."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={Utensils}
                            title="Real-time Updates"
                            description="Track order status in real-time and communicate directly with kitchen staff for special requests."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={CreditCard}
                            title="Seamless Payment"
                            description="Pay directly from your phone with multiple payment options and easy bill splitting for groups."
                            delay={0.3}
                        />
                    </div>
                </div>
            </AnimatedSection>

            {/* Benefits Section */}
            <AnimatedSection className="bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-16">
                        <div>
                            <h2 className="text-3xl font-bold mb-8 dark:text-white">For Diners</h2>
                            <ul className="space-y-6">
                                {[
                                    {
                                        title: "No More Waiting",
                                        description: "Order and pay at your convenience without flagging down servers.",
                                    },
                                    {
                                        title: "Detailed Information",
                                        description: "Access comprehensive menu details including allergens and dietary information.",
                                    },
                                    {
                                        title: "Easy Bill Splitting",
                                        description: "Split the bill effortlessly among friends without awkward calculations.",
                                    },
                                    {
                                        title: "Order Accuracy",
                                        description: "Ensure your order is exactly as you want it with special instructions.",
                                    },
                                ].map((benefit, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex"
                                    >
                                        <div className="mr-4 mt-1">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tabletap-purple/10 dark:bg-tabletap-purple/20">
                                                <CheckCircle className="h-5 w-5 text-tabletap-purple dark:text-tabletap-purple-light" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-1 dark:text-white">{benefit.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold mb-8 dark:text-white">For Restaurants</h2>
                            <ul className="space-y-6">
                                {[
                                    {
                                        title: "Increased Efficiency",
                                        description: "Serve more customers with fewer staff and reduce labor costs.",
                                    },
                                    {
                                        title: "Higher Table Turnover",
                                        description: "Reduce wait times and increase revenue with faster service.",
                                    },
                                    {
                                        title: "Valuable Customer Data",
                                        description: "Gain insights into ordering patterns and customer preferences.",
                                    },
                                    {
                                        title: "Reduced Errors",
                                        description: "Eliminate miscommunications between customers, servers, and kitchen.",
                                    },
                                ].map((benefit, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex"
                                    >
                                        <div className="mr-4 mt-1">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tabletap-orange/10 dark:bg-tabletap-orange/20">
                                                <CheckCircle className="h-5 w-5 text-tabletap-orange dark:text-tabletap-orange-light" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-1 dark:text-white">{benefit.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            {/* How It Works Section */}
            <AnimatedSection className="bg-gradient-to-br from-tabletap-purple/5 to-tabletap-orange/5 dark:from-tabletap-purple/10 dark:to-tabletap-orange/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 dark:text-white">How Scan&Snack Works</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            A simple three-step process that transforms the dining experience
                        </p>
                    </div>

                    <div className="relative max-w-4xl mx-auto">
                        {/* Connection line */}
                        <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-tabletap-purple to-tabletap-orange hidden md:block" />

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    step: 1,
                                    title: "Scan QR Code",
                                    description: "Customers scan a unique QR code at their table using their smartphone camera.",
                                    delay: 0.1,
                                },
                                {
                                    step: 2,
                                    title: "Browse & Order",
                                    description: "View the digital menu, customize items, and place orders directly from their device.",
                                    delay: 0.3,
                                },
                                {
                                    step: 3,
                                    title: "Pay & Go",
                                    description: "Pay securely through the system when ready, with no waiting for the check.",
                                    delay: 0.5,
                                },
                            ].map((item) => (
                                <motion.div
                                    key={item.step}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: item.delay, duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className="flex flex-col items-center text-center relative"
                                >
                                    <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg mb-6">
                                        <span className="text-2xl font-bold text-gradient">{item.step}</span>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3 dark:text-white">{item.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            {/* Final CTA Section */}
            <section className="bg-tabletap-gradient py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Join Our Waitlist Today</h2>
                            <p className="text-white/90 text-lg mb-8">
                                Be the first to experience Scan&Snack when we launch. Get early access, exclusive benefits, and special
                                pricing for early adopters.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="bg-white/20 rounded-full p-2 mr-4">
                                        <CheckCircle className="h-5 w-5 text-white" />
                                    </div>
                                    <p className="text-white/90">Early access to our platform</p>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-white/20 rounded-full p-2 mr-4">
                                        <CheckCircle className="h-5 w-5 text-white" />
                                    </div>
                                    <p className="text-white/90">Special pricing for early adopters</p>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-white/20 rounded-full p-2 mr-4">
                                        <CheckCircle className="h-5 w-5 text-white" />
                                    </div>
                                    <p className="text-white/90">Priority onboarding and support</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reserve Your Spot</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Fill out the form below to join our waitlist and be notified when we launch.
                            </p>

                            {!subscribed ? (
                                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                                            Full Name
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="John Doe"
                                            className="mt-1 w-full border-gray-300 dark:border-gray-600 focus:border-tabletap-purple dark:focus:border-tabletap-purple"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            className="mt-1 w-full border-gray-300 dark:border-gray-600 focus:border-tabletap-purple dark:focus:border-tabletap-purple"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="restaurantName" className="text-gray-700 dark:text-gray-300">
                                            Restaurant Name (Optional)
                                        </Label>
                                        <Input
                                            id="restaurantName"
                                            type="text"
                                            placeholder="Your Restaurant"
                                            className="mt-1 w-full border-gray-300 dark:border-gray-600 focus:border-tabletap-purple dark:focus:border-tabletap-purple"
                                            value={restaurantName}
                                            onChange={(e) => setRestaurantName(e.target.value)}
                                        />
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Let us know if you&apos;re representing a restaurant.
                                        </p>
                                    </div>

                                    <Button type="submit" className="w-full bg-tabletap-purple hover:bg-tabletap-purple/90 text-white" disabled={isSubmitting}>
                                        {isSubmitting ? "Joining..." : "Join Waitlist"}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </form>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You&apos;re on the List!</h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Thank you for joining our waitlist. We&apos;ll notify you as soon as Scan&Snack is available in your area.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-6 md:mb-0">
                            <Link href="/" className="text-2xl font-bold">
                                <span className="text-tabletap-purple-light">Scan&</span>
                                <span className="text-tabletap-orange-light">Snack</span>
                            </Link>
                            <p className="mt-2 text-gray-400">The future of restaurant ordering</p>
                        </div>
                        {/*<div className="flex space-x-6">
                            <Link href="/terms-and-conditions" className="text-gray-400 hover:text-white transition-colors">
                                Terms
                            </Link>
                            <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                                Privacy
                            </Link>
                            <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                                Contact
                            </Link>
                        </div>*/}
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
                        <p>&copy; {new Date().getFullYear()} Scan&Snack. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
