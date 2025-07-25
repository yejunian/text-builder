import Mustached from "./mustached";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function ReferenceErrorBadge() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="destructive">참조 오류</Badge>
      </TooltipTrigger>

      <TooltipContent>
        <p>
          이 필드는 치환할 수 없는 <Mustached>참조</Mustached>를 포함하고
          있습니다.
          <br />
          치환할 수 없는 참조는 <Mustached>참조</Mustached> 그대로 표시됩니다.
          <br />
          아래 중 한 가지 이상에 해당할 수 있습니다.
        </p>
        <ul className="list-outside list-disc pl-4">
          <li>존재하지 않는 필드 참조</li>
          <li>오류가 있는 필드 참조</li>
          <li>순환 참조</li>
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
