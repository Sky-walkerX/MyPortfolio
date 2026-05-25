interface PromptProps {
  user?: string;
  host?: string;
  path?: string;
}

export function Prompt({ user = "naman", host = "portfolio", path = "~" }: PromptProps) {
  return (
    <span className="prompt">
      <span className="u">{user}</span>
      <span className="c">@</span>
      <span className="h">{host}</span>
      <span className="c">:</span>
      <span className="p">{path}</span>
      <span className="d">$</span>
    </span>
  );
}

interface SectionHeadProps {
  cmd: React.ReactNode;
  num?: string;
}

export function SectionHead({ cmd, num }: SectionHeadProps) {
  return (
    <>
      <div className="line section-head">
        <Prompt />
        <span className="cmd">{cmd}</span>
        {num && <span className="num">{num}</span>}
      </div>
      <div className="section-rule" />
    </>
  );
}
