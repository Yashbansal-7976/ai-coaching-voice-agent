import {Button} from "@/components/ui/button";
import { UserButton } from "@stackframe/stack";
import Image from "next/image";

export default function Home() {
  return (
    <div>

          <a href="https://ai-coaching-voice-agent.vercel.app/" target="_blank">
            <button>Visit Site</button>
          </a>
          <UserButton/>
    </div>
  );
}
