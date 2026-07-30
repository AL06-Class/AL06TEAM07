type SelectOption = {
  label: string;
  value: string;
};

type FormFieldProps = {
  label: string;
  name: string;
  inputType: "text" | "email" | "url" | "number" | "date" | "select" | "multiselect" | "textarea" | "toggle";
  helper?: string;
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  value: string | string[] | boolean;
  onChange: (name: string, value: string | string[] | boolean) => void;
};

export function FormField({
  label,
  name,
  inputType,
  helper,
  placeholder,
  required,
  options = [],
  value,
  onChange
}: FormFieldProps) {
  function handleMultiSelect(nextValue: string) {
    const currentValues = Array.isArray(value) ? value : [];
    const exists = currentValues.includes(nextValue);
    onChange(
      name,
      exists
        ? currentValues.filter((item) => item !== nextValue)
        : [...currentValues, nextValue]
    );
  }

  return (
    <label className="grid gap-1.5 text-sm font-semibold text-[#2d3748]">
      <span>
        {label}
        {required ? <span className="ml-1 text-[#d05a36]">*</span> : null}
      </span>

      {inputType === "textarea" ? (
        <textarea
          name={name}
          value={String(value)}
          onChange={(event) => onChange(name, event.target.value)}
          rows={4}
          className="min-h-24 w-full resize-y rounded-md border border-[#dfe9f2] bg-[#fcfdff] px-3 py-2.5 text-sm font-normal leading-6 outline-none transition placeholder:text-[#9aa7b4] focus:border-[#0f6ea8] focus:bg-white focus:ring-2 focus:ring-[#d8ecf8]"
          placeholder={placeholder ?? `${label} 입력`}
        />
      ) : inputType === "select" ? (
        <select
          name={name}
          value={String(value)}
          onChange={(event) => onChange(name, event.target.value)}
          className="h-10 w-full rounded-md border border-[#dfe9f2] bg-[#fcfdff] px-3 text-sm font-normal outline-none transition focus:border-[#0f6ea8] focus:bg-white focus:ring-2 focus:ring-[#d8ecf8]"
        >
          <option value="">선택</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : inputType === "multiselect" ? (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const checked = Array.isArray(value) && value.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleMultiSelect(option.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-extrabold transition ${
                  checked
                    ? "border-[#0f6ea8] bg-[#eff8ff] text-[#0f5f99]"
                    : "border-[#dfe9f2] bg-[#fcfdff] text-[#667085] hover:bg-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : inputType === "toggle" ? (
        <button
          type="button"
          onClick={() => onChange(name, !value)}
          className={`h-10 w-fit rounded-full border px-4 text-sm font-extrabold transition ${
            value
              ? "border-[#0f6ea8] bg-[#eff8ff] text-[#0f5f99]"
              : "border-[#dfe9f2] bg-[#fcfdff] text-[#667085]"
          }`}
        >
          {value ? "가능" : "불가"}
        </button>
      ) : (
        <input
          name={name}
          type={inputType}
          value={String(value)}
          onChange={(event) => onChange(name, event.target.value)}
          min={inputType === "number" ? "0" : undefined}
          className="h-10 w-full rounded-md border border-[#dfe9f2] bg-[#fcfdff] px-3 text-sm font-normal outline-none transition placeholder:text-[#9aa7b4] focus:border-[#0f6ea8] focus:bg-white focus:ring-2 focus:ring-[#d8ecf8]"
          placeholder={placeholder ?? `${label} 입력`}
        />
      )}

      {helper ? (
        <span className="text-xs font-medium leading-5 text-[#748094]">
          {helper}
        </span>
      ) : null}
    </label>
  );
}
