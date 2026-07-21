import { FormEvent, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { FormField } from "./FormField";

const formSections = [
  {
    title: "신청확인",
    fields: [
      { label: "이름", name: "name", type: "text" },
      { label: "이메일", name: "email", type: "email" },
      { label: "거주지역", name: "region", type: "text" }
    ]
  },
  {
    title: "경력파악",
    fields: [
      { label: "개발총 경력연수", name: "experienceYears", type: "number" },
      { label: "주요언어 프레임워크", name: "mainStack", type: "text" },
      { label: "AI 개발경험", name: "aiExperience", type: "textarea" },
      { label: "보유자격증", name: "certifications", type: "text" },
      { label: "자격증직접입력", name: "certificationDetail", type: "text" }
    ]
  },
  {
    title: "과제 배정용",
    fields: [
      { label: "GitHub URL", name: "githubUrl", type: "url" },
      { label: "희망과제 유형", name: "preferredTaskType", type: "text" }
    ]
  },
  {
    title: "매칭조건",
    fields: [
      { label: "가능한시작시기", name: "availableStartDate", type: "date" },
      { label: "희망기간", name: "preferredDuration", type: "text" },
      { label: "희망 월보수", name: "desiredMonthlyPay", type: "number" },
      { label: "협상가능여부", name: "isNegotiable", type: "select" }
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
  certificationDetail: "",
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
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <Card className="border-[#bde7e8] bg-[#eefefe]">
        <CardContent>
          <div className="mb-4">
            <span className="inline-flex rounded-md bg-[#22c7c9] px-3 py-1 text-sm font-extrabold text-[#063f4a]">
              Section 4
            </span>
          </div>

          <div className="overflow-hidden rounded-md border border-[#d8e0e7] bg-white">
            {formSections.map((section) => (
              <div
                key={section.title}
                className="grid grid-cols-[120px_1fr] border-b border-[#e2e8ef] last:border-b-0 max-md:grid-cols-1"
              >
                <div className="border-r border-[#e2e8ef] bg-[#fbfdff] px-4 py-4 text-sm font-extrabold max-md:border-b max-md:border-r-0">
                  {section.title}
                </div>
                <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
                  {section.fields.map((field) => (
                    <FormField
                      key={field.name}
                      {...field}
                      value={
                        formData[field.name as keyof FreelancerProfileFormData]
                      }
                      onChange={handleFieldChange}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              className="h-10 rounded-md border border-border bg-white px-4 text-sm font-bold hover:bg-slate-50"
            >
              임시 저장
            </button>
            <button
              type="submit"
              className="h-10 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-[#0d5f91]"
            >
              제출
            </button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
