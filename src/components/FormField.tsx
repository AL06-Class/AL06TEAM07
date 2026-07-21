type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string | boolean;
  onChange: (name: string, value: string | boolean) => void;
};

export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange
}: FormFieldProps) {
  return (
    <label className="min-h-[86px] border-r border-t border-[#e7edf3] px-4 py-3 text-sm font-bold last:border-r-0">
      <span className="mb-2 block text-[#1f2937]">{label}</span>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={String(value)}
          onChange={(event) => onChange(name, event.target.value)}
          rows={2}
          className="min-h-16 w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-sm font-normal outline-none transition focus:border-[#0f6ea8] focus:ring-2 focus:ring-[#d8ecf8]"
          placeholder={`${label} 입력`}
        />
      ) : type === "select" ? (
        <select
          name={name}
          value={value ? "true" : "false"}
          onChange={(event) => onChange(name, event.target.value === "true")}
          className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm font-normal outline-none transition focus:border-[#0f6ea8] focus:ring-2 focus:ring-[#d8ecf8]"
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
          className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm font-normal outline-none transition focus:border-[#0f6ea8] focus:ring-2 focus:ring-[#d8ecf8]"
          placeholder={`${label} 입력`}
        />
      )}
    </label>
  );
}
