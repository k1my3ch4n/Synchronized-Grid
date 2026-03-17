import Link from "next/link";
import { GITHUB_URL } from "@shared/constants";
import { LANDING_FEATURES } from "../constants";

export function LandingPage() {
  return (
    <main className="page-height flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full space-y-16 text-center">
        {/* Hero */}
        <div className="space-y-6">
          <h1 className="text-5xl sm:text-6xl font-bold text-text-primary tracking-tight animate-fade-in-up">
            프로젝트 싱긋 ( Syngrid )
          </h1>
          <p
            className="text-lg sm:text-xl text-text-secondary max-w-lg mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "0.15s" }}
          >
            하나의 URL을 여러 디바이스 뷰포트로 동시에 확인하고,
            <br className="hidden sm:block" />
            팀원과 실시간으로 공유하세요.
          </p>
          <div
            className="flex items-center justify-center gap-4 pt-2 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              href="/login"
              className="glass-btn px-8 py-3 text-base rounded-glass hover:shadow-[var(--shadow-accent-glow)]"
            >
              시작하기
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-surface px-8 py-3 text-base rounded-glass text-text-secondary hover:text-text-primary hover:bg-glass-hover hover-scale"
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {LANDING_FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-surface rounded-glass p-5 space-y-2 hover-lift animate-fade-in-up"
              style={{ animationDelay: `${0.45 + index * 0.1}s` }}
            >
              <h3 className="text-base font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
