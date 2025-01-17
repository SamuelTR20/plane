import { FormEvent, ReactElement, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
// icons
import { useTheme } from "next-themes";
import { Eye, EyeOff } from "lucide-react";
// ui
import { Button, Input, TOAST_TYPE, setToast } from "@plane/ui";
// components
import { PasswordStrengthMeter } from "@/components/account";
import { PageHead } from "@/components/core";
// helpers
import { EPageTypes } from "@/helpers/authentication.helper";
import { getPasswordStrength } from "@/helpers/password.helper";
// hooks
import { useUser } from "@/hooks/store";
// layouts
import DefaultLayout from "@/layouts/default-layout";
// lib
import { NextPageWithLayout } from "@/lib/types";
// wrappers
import { AuthenticationWrapper } from "@/lib/wrappers";
// services
import { AuthService } from "@/services/auth.service";
// images
import PlaneBackgroundPatternDark from "public/auth/background-pattern-dark.svg";
import PlaneBackgroundPattern from "public/auth/background-pattern.svg";
import BluePlaneLogoWithoutText from "public/plane-logos/blue-without-text.png";

type TResetPasswordFormValues = {
  email: string;
  password: string;
  confirm_password?: string;
};

const defaultValues: TResetPasswordFormValues = {
  email: "",
  password: "",
};

// services
const authService = new AuthService();

const SetPasswordPage: NextPageWithLayout = observer(() => {
  // router
  const router = useRouter();
  const { email } = router.query;
  // states
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState<TResetPasswordFormValues>({
    ...defaultValues,
    email: email ? email.toString() : "",
  });
  const [csrfToken, setCsrfToken] = useState<string | undefined>(undefined);
  const [isPasswordInputFocused, setIsPasswordInputFocused] = useState(false);
  const [isRetryPasswordInputFocused, setIsRetryPasswordInputFocused] = useState(false);
  // hooks
  const { resolvedTheme } = useTheme();
  // hooks
  const { data: user, handleSetPassword } = useUser();

  useEffect(() => {
    if (csrfToken === undefined)
      authService.requestCSRFToken().then((data) => data?.csrf_token && setCsrfToken(data.csrf_token));
  }, [csrfToken]);

  const handleFormChange = (key: keyof TResetPasswordFormValues, value: string) =>
    setPasswordFormData((prev) => ({ ...prev, [key]: value }));

  const isButtonDisabled = useMemo(
    () =>
      !!passwordFormData.password &&
      getPasswordStrength(passwordFormData.password) >= 3 &&
      passwordFormData.password === passwordFormData.confirm_password
        ? false
        : true,
    [passwordFormData]
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (!csrfToken) throw new Error("csrf token not found");
      await handleSetPassword(csrfToken, { password: passwordFormData.password });
      router.push("/");
    } catch (err: any) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error!",
        message: err?.error ?? "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <PageHead title="Reset Password" />
      <div className="absolute inset-0 z-0">
        <Image
          src={resolvedTheme === "dark" ? PlaneBackgroundPatternDark : PlaneBackgroundPattern}
          className="w-full h-full object-cover"
          alt="Plane background pattern"
        />
      </div>
      <div className="relative z-10 w-screen h-screen overflow-hidden overflow-y-auto flex flex-col">
        <div className="container mx-auto px-10 lg:px-0 flex-shrink-0 relative flex items-center justify-between pb-4 transition-all">
          <div className="flex items-center gap-x-2 py-10">
            <Image src={BluePlaneLogoWithoutText} height={30} width={30} alt="Plane Logo" />
            <span className="text-2xl font-semibold sm:text-3xl">Plane</span>
          </div>
        </div>
        <div className="flex-grow container mx-auto max-w-lg px-10 lg:max-w-md lg:px-5 py-10 lg:pt-28 transition-all">
          <div className="relative flex flex-col space-y-6">
            <div className="text-center space-y-1 py-4">
              <h3 className="flex gap-4 justify-center text-3xl font-bold text-onboarding-text-100">
                Secure your account
              </h3>
              <p className="font-medium text-onboarding-text-400">Setting password helps you login securely</p>
            </div>
            <form className="mt-5 space-y-4" onSubmit={(e) => handleSubmit(e)}>
              <div className="space-y-1">
                <label className="text-sm text-onboarding-text-300 font-medium" htmlFor="email">
                  Email
                </label>
                <div className="relative flex items-center rounded-md bg-onboarding-background-200">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={user?.email}
                    //hasError={Boolean(errors.email)}
                    placeholder="name@company.com"
                    className="h-[46px] w-full border border-onboarding-border-100 !bg-onboarding-background-200 pr-12 text-onboarding-text-400 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-onboarding-text-300 font-medium" htmlFor="password">
                  Set a password
                </label>
                <div className="relative flex items-center rounded-md bg-onboarding-background-200">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={passwordFormData.password}
                    onChange={(e) => handleFormChange("password", e.target.value)}
                    //hasError={Boolean(errors.password)}
                    placeholder="Enter password"
                    className="h-[46px] w-full border border-onboarding-border-100 !bg-onboarding-background-200 pr-12 placeholder:text-onboarding-text-400"
                    minLength={8}
                    onFocus={() => setIsPasswordInputFocused(true)}
                    onBlur={() => setIsPasswordInputFocused(false)}
                    autoFocus
                  />
                  {showPassword ? (
                    <EyeOff
                      className="absolute right-3 h-5 w-5 stroke-custom-text-400 hover:cursor-pointer"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <Eye
                      className="absolute right-3 h-5 w-5 stroke-custom-text-400 hover:cursor-pointer"
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </div>
                {isPasswordInputFocused && <PasswordStrengthMeter password={passwordFormData.password} />}
              </div>
              <div className="space-y-1">
                <label className="text-sm text-onboarding-text-300 font-medium" htmlFor="confirm_password">
                  Confirm password
                </label>
                <div className="relative flex items-center rounded-md bg-onboarding-background-200">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="confirm_password"
                    value={passwordFormData.confirm_password}
                    onChange={(e) => handleFormChange("confirm_password", e.target.value)}
                    placeholder="Confirm password"
                    className="h-[46px] w-full border border-onboarding-border-100 !bg-onboarding-background-200 pr-12 placeholder:text-onboarding-text-400"
                    onFocus={() => setIsRetryPasswordInputFocused(true)}
                    onBlur={() => setIsRetryPasswordInputFocused(false)}
                  />
                  {showPassword ? (
                    <EyeOff
                      className="absolute right-3 h-5 w-5 stroke-custom-text-400 hover:cursor-pointer"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <Eye
                      className="absolute right-3 h-5 w-5 stroke-custom-text-400 hover:cursor-pointer"
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </div>
                {!!passwordFormData.confirm_password &&
                  passwordFormData.password !== passwordFormData.confirm_password &&
                  !isRetryPasswordInputFocused && (
                    <span className="text-sm text-red-500">Passwords don{"'"}t match</span>
                  )}
              </div>
              <Button type="submit" variant="primary" className="w-full" size="lg" disabled={isButtonDisabled}>
                Continue
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});

SetPasswordPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthenticationWrapper pageType={EPageTypes.SET_PASSWORD}>
      <DefaultLayout>{page}</DefaultLayout>
    </AuthenticationWrapper>
  );
};

export default SetPasswordPage;
