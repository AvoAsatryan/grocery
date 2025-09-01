// app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Clock, Share2, CheckCircle } from "lucide-react";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

const features = [
  {
    icon: <ShoppingCart className="h-10 w-10" />,
    title: "Smart Shopping Lists",
    description: "Create and manage your grocery lists with ease. Never forget an item again!",
  },
  {
    icon: <Clock className="h-10 w-10" />,
    title: "Quick & Easy",
    description: "Add items in seconds with our intuitive interface and smart suggestions.",
  },
  {
    icon: <Share2 className="h-10 w-10" />,
    title: "Share with Family",
    description: "Collaborate on shopping lists with your family members in real-time.",
  },
  {
    icon: <CheckCircle className="h-10 w-10" />,
    title: "Never Miss an Item",
    description: "Get smart reminders and suggestions based on your shopping habits.",
  },
];

export default async function Home() {
  const session = await getServerSession(options)
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Never forget your grocery list again
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  The smart way to organize your shopping. Create, share, and manage your grocery lists with ease.
                </p>
              </div>
              <div className="space-x-4 pt-4">
                {session ? (
                  <Button asChild size="lg">
                    <Link href="/dashboard">Get Started</Link>
                  </Button>
                ) : (
                  <Button asChild size="lg">
                    <Link href="/signup">Get Started</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Features
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to make grocery shopping a breeze.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to get started?
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Join thousands of users who are already simplifying their grocery shopping.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/signup">Create Your Free Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Grocery List App. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/privacy">Privacy</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/terms">Terms</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}