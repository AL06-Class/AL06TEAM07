import { FormEvent, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { FormField } from "./FormField";

type FieldConfig = {
  label: string;
  name: keyof typeof freelancerProfileInitialData;
  inputType: "text" | "email" | "url" | "number" | "date" | "select" | "multiselect" | "textarea" | "toggle";
  helper?: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
};

const languageOptions = [
  { label: "Python", value: "python" },
  { label: "FastAPI", value: "fastapi" },
  { label: "LangChain", value: "langchain" },
  { label: "JS/TS", value: "js-ts" },
  { label: "React", value: "react" },
  { label: "Node", value: "node" }
];

const certificateOptions = [
  { label: "정보처리기사", value: "engineer-information-processing" },
  { label: "AWS", value: "aws" },
  { label: "ADsP", value: "adsp" },
  { label: "SQLD", value: "sqld" },
  { label: "OPIc", value: "opic" }
];

const taskTypeOptions = [
  { label: "LLM 연동", value: "llm" },
  { label: "RAG", value: "rag" },
  { label: "AI 에이전트", value: "agent" },
  { label: "기타", value: "etc" }
];

const startTimingOptions = [
  { label: "즉시", value: "now" },
  { label: "2주 후", value: "two-weeks" },
  { label: "1개월 후", value: "one-month" }
];

const durationOptions = [
  { label: "1개월 미만", value: "under-one-month" },
  { label: "1~3개월", value: "one-to-three" },
  { label: "3~6개월", value: "three-to-six" },
  { label: "단기", value: "short" },
  { label: "장기", value: "long" }
];

const payOptions = [
  { label: "200만원 미만", value: "under-200" },
  { label: "200~300", value: "200-300" },
  { label: "300~400", value: "300-400" },
  { label: "400~500", value: "400-500" },
  { label: "500만원 이상", value: "over-500" }
];

const formSections: {
  id: string;
  title: string;
  description: string;
  fields: FieldConfig[];
}[] = [
  {
    id: "basic",
    title: "신청 확인",
    description: "매칭 안내와 과제 안내를 받을 기본 정보를 입력합니다.",
    fields: [
      {
        label: "이름",
        name: "name",
        inputType: "text",
        required: true,
        placeholder: "홍길동",
        helper: "계약 알림에 사용되는 실명"
      },
      {
        label: "이메일",
        name: "email",
        inputType: "email",
        required: true,
        placeholder: "name@example.com",
        helper: "과제 안내와 결과 통보 수신 채널"
      },
      {
        label: "거주 지역",
        name: "region",
        inputType: "select",
        required: true,
        options: [
          { label: "서울", value: "seoul" },
          { label: "경기", value: "gyeonggi" },
          { label: "지방", value: "local" },
          { label: "해외", value: "overseas" }
        ],
        helper: "대면 미팅 가능 여부 보조"
      }
    ]
  },
  {
    id: "career",
    title: "경력 파악",
    description: "경력과 기술 스택을 기준으로 과제 난이도와 매칭 적합도를 판단합니다.",
    fields: [
      {
        label: "개발 총 경력 연수",
        name: "experienceYears",
        inputType: "number",
        required: true,
        placeholder: "3",
        helper: "1년 미만, 1~3년, 3~5년, 5년 이상 판단"
      },
      {
        label: "주요 언어/프레임워크",
        name: "mainStack",
        inputType: "multiselect",
        required: true,
        options: languageOptions,
        helper: "복수 선택 가능"
      },
      {
        label: "AI 개발 경험",
        name: "aiExperience",
        inputType: "textarea",
        required: true,
        placeholder: "예: 이력서 요약 챗봇 구축 / RAG 검색 기능 구현",
        helper: "AI 툴 사용 경험과 과제 레벨 구분에 활용"
      },
      {
        label: "보유 자격증",
        name: "certifications",
        inputType: "multiselect",
        options: certificateOptions,
        helper: "선택 항목은 신뢰도 점수에 가산"
      },
      {
        label: "자격증 직접 입력",
        name: "certificationDetail",
        inputType: "text",
        placeholder: "Google ML Engineer",
        helper: "목록에 없는 자격증 입력, 최대 3개"
      }
    ]
  },
  {
    id: "task",
    title: "과제 배정용",
    description: "GitHub와 희망 과제 유형을 기준으로 검증 과제를 배정합니다.",
    fields: [
      {
        label: "GitHub URL",
        name: "githubUrl",
        inputType: "url",
        required: true,
        placeholder: "https://github.com/username/repo",
        helper: "프로젝트 코드 공개 또는 시스템 자동 분석"
      },
      {
        label: "희망 과제 유형",
        name: "preferredTaskType",
        inputType: "select",
        required: true,
        options: taskTypeOptions,
        helper: "과제 매칭 정확도 향상"
      }
    ]
  },
  {
    id: "matching",
    title: "매칭 조건",
    description: "투입 가능 일정과 비용 조건을 기준으로 기업과 매칭합니다.",
    fields: [
      {
        label: "가능한 시작 시기",
        name: "availableStartTiming",
        inputType: "select",
        required: true,
        options: startTimingOptions,
        helper: "즉시, 2주 후, 1개월 후"
      },
      {
        label: "희망 프로젝트 기간",
        name: "preferredDuration",
        inputType: "select",
        required: true,
        options: durationOptions,
        helper: "기업 프로젝트 기간과 매칭"
      },
      {
        label: "희망 월 보수",
        name: "desiredMonthlyPay",
        inputType: "select",
        required: true,
        options: payOptions,
        helper: "기업 예산과 교차 필터링"
      },
      {
        label: "협상 가능 여부",
        name: "isNegotiable",
        inputType: "toggle",
        required: true,
        helper: "가능 선택 시 CTO가 협상 제안 가능"
      }
    ]
  }
];

export const freelancerProfileInitialData = {
  name: "",
  email: "",
  region: "",
  experienceYears: "",
  mainStack: [] as string[],
  aiExperience: "",
  certifications: [] as string[],
  certificationDetail: "",
  githubUrl: "",
  preferredTaskType: "",
  availableStartTiming: "",
  preferredDuration: "",
  desiredMonthlyPay: "",
  isNegotiable: false
};

type FreelancerProfileFormData = typeof freelancerProfileInitialData;

export function FreelancerProfileForm() {
  const [formData, setFormData] = useState<FreelancerProfileFormData>(
    freelancerProfileInitialData
  );
  const [notice, setNotice] = useState("");

  function handleFieldChange(name: string, value: string | string[] | boolean) {
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("등록 완료 화면으로 이동하는 UI 시안입니다. 실제 제출은 연결하지 않았습니다.");
  }

  function handleDraftClick() {
    setNotice("임시 저장 기능은 아직 연결하지 않았습니다.");
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {notice ? (
        <div className="rounded-lg border border-[#b8def3] bg-[#f1f9fe] px-4 py-3 text-sm font-bold text-[#0f5f99]">
          {notice}
        </div>
      ) : null}

      {formSections.map((section, index) => (
        <Card
          key={section.title}
          id={section.id}
          className="scroll-mt-5 overflow-hidden border-[#e3edf5] shadow-sm"
        >
          <CardContent className="p-0">
            <div className="grid grid-cols-[170px_minmax(0,1fr)] max-md:grid-cols-1">
              <div className="border-r border-[#e3edf5] bg-[#fbfdff] p-5 max-md:border-b max-md:border-r-0">
                <span className="grid size-9 place-items-center rounded-full bg-[#f1f9fe] text-sm font-extrabold text-[#0f6ea8]">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-xl font-extrabold text-[#172033]">
                  {section.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#667085]">
                  {section.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5 p-5 max-md:grid-cols-1">
                {section.fields.map((field) => (
                  <div
                    key={field.name}
                    className={field.inputType === "textarea" ? "md:col-span-2" : ""}
                  >
                    <FormField
                      {...field}
                      value={formData[field.name as keyof FreelancerProfileFormData]}
                      onChange={handleFieldChange}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center justify-between gap-4 rounded-lg border border-[#e3edf5] bg-white p-4 shadow-sm max-md:flex-col max-md:items-stretch">
        <p className="text-sm font-semibold text-[#667085]">
          현재 단계는 UI 시안이며 저장 기능은 연결하지 않았습니다.
        </p>
        <div className="flex gap-3 max-md:grid max-md:grid-cols-2">
          <button
            type="button"
            onClick={handleDraftClick}
            className="h-10 rounded-md border border-[#d7e2ec] bg-white px-5 text-sm font-extrabold text-[#263445] hover:bg-[#f8fbfd]"
          >
            임시 저장
          </button>
          <button
            type="submit"
            className="h-10 rounded-md bg-[#0f6ea8] px-5 text-sm font-extrabold text-white hover:bg-[#0d5f91]"
          >
            등록 완료 보기
          </button>
        </div>
      </div>
    </form>
  );
}
