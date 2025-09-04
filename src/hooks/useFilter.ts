import React, { useRef } from "react";

export default function useFilter(cb: (...args: any) => any) {
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
    const searchValue = event.target.value.toLowerCase();
    cb(searchValue);
  }
  
  return function (args: React.ChangeEvent<HTMLInputElement>) {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(() => {
      handleSearch(args);
    }, 300);
  };
}
