import router from "next/router";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    router.push(`/place/metachicken`);
  }, []);
  return <div></div>;
}
