"use client";
import {EditorPage} from "../../EditorPage.jsx";
import {useParams} from "next/navigation";

export const runtime = "edge";

export default function Page() {
  const {id} = useParams();
  return <EditorPage id={id} />;
}
