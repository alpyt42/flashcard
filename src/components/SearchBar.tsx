import { useState, useEffect } from "react";
import { TextInput } from "@mantine/core";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const [internal, setInternal] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(internal);
    }, 150);
    return () => clearTimeout(handler);
  }, [internal, onChange]);

  useEffect(() => {
    setInternal(value);
  }, [value]);

  return (
    <TextInput
      value={internal}
      onChange={(e) => setInternal(e.currentTarget.value)}
      placeholder={placeholder}
      icon={
        <span role="img" aria-label="search">
          🔍
        </span>
      }
      autoComplete="off"
    />
  );
}
