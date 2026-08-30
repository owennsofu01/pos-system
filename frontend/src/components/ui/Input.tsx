import { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("input", props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("input", props.className)} />;
}

interface FieldProps {
  label: string;
  children: ReactNode;
  className?: string;
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
}

export function Field({ label, children, className }: FieldProps) {
  return (
    <div className={cn("field", className)}>
      <label>{label}</label>
      {children}
    </div>
  );
}
