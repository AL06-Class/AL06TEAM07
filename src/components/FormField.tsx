type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  wide?: boolean;
  value: string | boolean;
  onChange: (name: string, value: string | boolean) => void;
};

export function FormField({
  label,
  name,
  type = "text",
  required,
  wide,
  value,
  onChange
}: FormFieldProps) {
  const wrapperClass = wide
    ? "grid gap-2 text-sm font-bold md:col-span-2"
    : "grid gap-2 text-sm font-bold";

  return (
    <label className={wrapperClass}>
      <span>
        {label}
        {required ? <span className="text-[#b54708]"> *</span> : null}
      </span>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={String(value)}
          onChange={(event) => onChange(name, event.target.value)}
          rows={4}
          className="min-h-28 resize-y rounded-md border border-border bg-white px-3 py-3 text-sm font-normal outline-none transition focus:border-[#0f6ea8] focus:ring-2 focus:ring-[#d8ecf8]"
          placeholder={`${label} 입력`}
        />
      ) : type === "select" ? (
        <select
          name={name}
          value={value ? "true" : "false"}
          onChange={(event) => onChange(name, event.target.value === "true")}
          className="h-11 rounded-md border border-border bg-white px-3 text-sm font-normal outline-none transition focus:border-[#0f6ea8] focus:ring-2 focus:ring-[#d8ecf8]"
        >
          <option value="false">불가</option>
          <option value="true">가능</option>
        </select>
      ) : (
        <input
          name={name}
          type={type}
          value={String(value)}
          onChange={(event) => onChange(name, event.target.value)}
          min={type === "number" ? "0" : undefined}
          className="h-11 rounded-md border border-border bg-white px-3 text-sm font-normal outline-none transition focus:border-[#0f6ea8] focus:ring-2 focus:ring-[#d8ecf8]"
          placeholder={`${label} 입력`}
        />
      )}
    </label>
  );
}
