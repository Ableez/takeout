import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Get started</h1>
        <p className="text-sm text-muted-foreground">
          Another account. Exciting.
        </p>
      </div>
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary:
              "bg-primary text-primary-foreground hover:bg-primary/90",
            card: "bg-card shadow-none border border-border",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton:
              "bg-background border border-input hover:bg-accent",
            formFieldInput:
              "bg-background border border-input focus:ring-ring",
            footerActionLink: "text-primary hover:text-primary/80",
          },
        }}
      />
    </div>
  );
}
