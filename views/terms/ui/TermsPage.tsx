"use client";

import Link from "next/link";
import { LAST_UPDATED, TERMS_SECTIONS } from "../constants";

export function TermsPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4">
      <div className="glass rounded-2xl p-8 w-full max-w-2xl space-y-6 animate-fade-in-up">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-primary">
            서비스 이용약관
          </h1>
          <p className="text-xs text-text-muted">최종 수정일: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-5">
          {TERMS_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <h2 className="text-sm font-semibold text-text-primary">
                {section.title}
              </h2>
              {section.content && (
                <p className="text-sm text-text-secondary leading-relaxed">
                  {section.content}
                </p>
              )}
            </div>
          ))}
          <div className="space-y-1.5">
            <p className="text-sm text-text-secondary leading-relaxed">
              서비스 관련 문의는 아래 채널을 통해 접수할 수 있습니다.
            </p>
            <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
              <li>
                GitHub Issues:{" "}
                <a
                  href="https://github.com/k1my3ch4n/Synchronized-Grid/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  github.com/k1my3ch4n/Synchronized-Grid
                </a>
              </li>
              <li>
                이메일:{" "}
                <a
                  href="mailto:k1my3ch4n@gmail.com"
                  className="text-accent hover:underline"
                >
                  k1my3ch4n@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-glass-border">
          <Link
            href="/login"
            className="text-sm text-accent hover:underline transition-colors"
          >
            &larr; 로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
