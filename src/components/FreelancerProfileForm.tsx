import { FormEvent, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { FormField } from "./FormField";

const formSections = [
  {
    title: "신원확인",
    description: "기업 담당자가 기본 연락 정보를 확인할 수 있게 입력합니다.",
    fields: [
      { label: "이름", name: "name", type: "text", required: true },
      { label: "이메일", name: "email", type: "email", required: true },
      { label: "거주지역", name: "region", type: "text", required: true }
    ]
  },
  {
    title: "경력파악",
    description: "검증 프로필에서 가장 먼저 비교되는 경력 정보를 정리합니다.",
    fields: [
      {
        label: "개발 총 경력 연수",
        name: "experienceYears",
        type: "number",
        required: true
      },
      {
        label: "주요 언어 / 프레임워크",
        name: "mainStack",
        type: "text",
        required: true
      },
      {
        label: "AI 개발 경험",
        name: "aiExperience",
        type: "textarea",
        required: true
      },
      {
        label: "보유 자격증",
        name: "certifications",
        type: "text",
        required: false
      },
      {
        label: "경력 설명",
        name: "careerDescription",
        type: "textarea",
        required: true,
        wide: true
      }
    ]
  },
  {
    title: "과제 배정용",
    description: "검증 과제와 포트폴리오 확인에 필요한 정보를 입력합니다.",
    fields: [
      { label: "GitHub URL", name: "githubUrl", type: "url", required: true },
      {
        label: "희망 과제 유형",
        name: "preferredTaskType",
        type: "text",
        required: true
      }
    ]
  },
  {
    title: "매칭조건",
    description: "프로젝트 투입 가능 조건을 기업이 빠르게 비교할 수 있게 합니다.",
    fields: [
      {
        label: "가능한 시작 시기",
        name: "availableStartDate",
        type: "date",
        required: true
      },
      {
        label: "희망 기간",
        name: "preferredDuration",
        type: "text",
        required: true
      },
      {
        label: "희망 월 보수",
        name: "desiredMonthlyPay",
        type: "number",
        required: true
      },
      {
        label: "협상 가능 여부",
        name: "isNegotiable",
        type: "select",
        required: true
      }
    ]
  }
];

export const freelancerProfileInitialData = {
  name: "",
  email: "",
  region: "",
  experienceYears: "",
  mainStack: "",
  aiExperience: "",
  certifications: "",
  careerDescription: "",
  githubUrl: "",
  preferredTaskType: "",
  availableStartDate: "",
  preferredDuration: "",
  desiredMonthlyPay: "",
  isNegotiable: false
};

type FreelancerProfileFormData = typeof freelancerProfileInitialData;

export function FreelancerProfileForm() {
  const [formData, setFormData] = useState<FreelancerProfileFormData>(
    freelancerProfileInitialData
  );

  function handleFieldChange(name: string, value: string | boolean) {
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(formData);
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      {formSections.map((section, sectionIndex) => (
        <Card key={section.title} className="border-[#d7e4ef]">
          <CardContent>
            <div className="mb-5 flex items-start gap-4">
              <span className="grid size-9 flex-none place-items-center rounded-full bg-[#0f6ea8] text-sm font-extrabold text-white">
                {sectionIndex + 1}
              </span>
              <div>
                <h3 className="text-xl font-extrabold">{section.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {section.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
              {section.fields.map((field) => (
                <FormField
                  key={field.name}
                  {...field}
                  value={formData[field.name as keyof FreelancerProfileFormData]}
                  onChange={handleFieldChange}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="sticky bottom-0 flex items-center justify-between gap-4 rounded-lg border border-border bg-white/95 p-4 shadow-[0_-8px_24px_rgba(15,95,153,0.08)] backdrop-blur max-md:flex-col max-md:items-stretch">
        <p className="text-sm font-bold text-muted">
          현재 단계에서는 입력값을 화면 상태로만 관리하며 API 연결은 하지 않습니다.
        </p>
        <div className="flex gap-3 max-md:grid max-md:grid-cols-2">
          <button
            type="button"
            className="h-11 rounded-md border border-border bg-white px-5 text-sm font-bold hover:bg-slate-50"
          >
            임시 저장
          </button>
          <button
            type="submit"
            className="h-11 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-[#0d5f91]"
          >
            제출
          </button>
        </div>
      </div>
    </form>
  );
}
