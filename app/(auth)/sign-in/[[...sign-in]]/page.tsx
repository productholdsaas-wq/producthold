import { SignIn } from "@clerk/nextjs";
import AuthLayout from "../../_components/AuthLayout";

export default function Page() {
  return (
    <AuthLayout>
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome to VidShortify</h2>
        <p className="text-gray-400">Sign in to create amazing videos</p>
      </div>

      <SignIn
        forceRedirectUrl="/dashboard"
        appearance={{
          layout: {
            socialButtonsPlacement: "top",
            logoImageUrl: "",
          },
          variables: {
            colorPrimary: "#413BFA",
            colorText: "white",
            colorBackground: "transparent",
            colorInputBackground: "#050a1f",
            colorInputText: "white",
          },
          elements: {
            socialButtonsBlockButton:
              "bg-elevated hover:bg-elevated/80 border border-brand-primary/20 rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.2)] text-white h-12",
            socialButtonsBlockButtonText: "!text-white font-medium",
            socialButtonsIconButton: "text-white",

            rootBox: "w-full",
            card: "bg-transparent shadow-none p-0 w-full",

            headerTitle: "hidden", // Hide default header as we added custom one
            headerSubtitle: "hidden",

            formFieldLabel: "text-gray-300",
            formFieldInput:
              "bg-elevated border border-brand-primary/20 text-white placeholder-gray-500 rounded-lg h-11 focus:border-brand-primary focus:ring-brand-primary/20",

            formButtonPrimary:
              "btn-primary rounded-lg h-11 mt-2",

            footer: "text-gray-400 mt-6",
            footerActionLink: "text-brand-primary hover:text-brand-primary-light hover:underline font-medium",
            footerPages: "hidden", // Hide "Secured by Clerk" and "Development mode"

            dividerLine: "bg-white/10",
            dividerText: "text-gray-500",
          },
        }}
      />
    </AuthLayout>
  );
}
