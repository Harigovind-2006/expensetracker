import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { Login } from "../types/Expense";

export default function Login() {
  const [loginData, setLoginData] = useState<Login>({
    email: "",
    password: "",
  });

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(loginData);
  };

  return (
    <div className="min-h-screen bg-[#0E0B16] flex">

      {/* Left Section */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 bg-gradient-to-br from-[#171220] to-[#0E0B16]">

        <div className="max-w-lg">

          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-3xl">
              💰
            </div>

            <h1 className="text-4xl font-bold text-white">
              Finance Pro
            </h1>

          </div>

          <h2 className="mt-10 text-5xl font-bold text-white leading-tight">
            Manage your money smarter.
          </h2>

          <p className="mt-6 text-lg text-gray-400 leading-8">
            Track expenses, monitor budgets, analyze spending,
            and stay financially organized with beautiful insights.
          </p>

          <div className="grid grid-cols-2 gap-6 mt-12">

            <div className="rounded-2xl border border-violet-900 bg-[#171220] p-6">
              <h3 className="text-3xl font-bold text-violet-400">
                ₹42K+
              </h3>
              <p className="text-gray-400 mt-2">
                Monthly Transactions
              </p>
            </div>

            <div className="rounded-2xl border border-violet-900 bg-[#171220] p-6">
              <h3 className="text-3xl font-bold text-violet-400">
                95%
              </h3>
              <p className="text-gray-400 mt-2">
                Budget Accuracy
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Right Section */}
      <div className="flex flex-1 items-center justify-center px-6">

        <div className="w-full max-w-md rounded-3xl border border-[#2D2542] bg-[#171220] p-10 shadow-2xl">

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 text-3xl">
              💰
            </div>

            <h2 className="mt-6 text-3xl font-bold text-white">
              Welcome Back
            </h2>

            <p className="mt-2 text-gray-400">
              Sign in to continue
            </p>

          </div>

          <form onSubmit={handleLogin} className="mt-10 space-y-6">

            <div>

              <label className="mb-2 block text-sm text-gray-300">
                Email
              </label>

              <input
                type="email"
                placeholder="example@gmail.com"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    email: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-[#352B4D] bg-[#221A2F] px-4 py-3 text-white placeholder:text-gray-500 outline-none transition focus:border-violet-500"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm text-gray-300">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    password: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-[#352B4D] bg-[#221A2F] px-4 py-3 text-white placeholder:text-gray-500 outline-none transition focus:border-violet-500"
              />

            </div>

            <div className="flex items-center justify-between">

              <label className="flex items-center gap-2 text-sm text-gray-400">

                <input
                  type="checkbox"
                  className="accent-violet-600"
                />

                Remember me

              </label>

              <button
                type="button"
                className="text-sm text-violet-400 hover:text-violet-300"
              >
                Forgot Password?
              </button>

            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-violet-600 py-3 text-lg font-semibold text-white transition hover:bg-violet-500"
            >
              Sign In
            </button>

          </form>

          <p className="mt-8 text-center text-gray-400">

            Don't have an account?

            <Link
              to="/register"
              className="ml-2 font-semibold text-violet-400 hover:text-violet-300"
            >
              Register
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}