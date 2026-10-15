import type { SVGProps } from "react";

export interface RipitaMarkProps extends SVGProps<SVGSVGElement> {
  animated?: boolean;
  title?: string;
}

export function RipitaMark({
  animated = false,
  className = "",
  title,
  ...props
}: RipitaMarkProps) {
  const classes = ["ripita-mark", animated ? "ripita-mark--animated" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      {...props}
      className={classes}
      viewBox="0 0 480 480"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <g className="ripita-mark__layer ripita-mark__structure">
        <path
          fill="#1E1B18"
          fillRule="evenodd"
          d="M99 56L231 57L260 60L287 66L312 76L336 92L355 113L367 134L374 159L374 184L370 201L364 214L357 224L342 238L326 247L307 252L290 252L274 249L260 243L249 235L234 216L225 198L212 161L207 152L198 143L188 139L171 141L159 148L147 163L157 164L163 167L171 176L177 191L183 227L186 305L195 339L203 355L215 372L234 391L248 401L99 401L99 56ZM166 99L159 101L153 105L151 109L170 128L190 108L190 106L181 100L166 99Z"
        />
      </g>
      <g className="ripita-mark__layer ripita-mark__figure">
        <path
          fill="#F3E7D3"
          d="M179 139L194 141L206 151L214 166L228 205L243 229L254 239L268 247L291 252L271 268L244 260L215 258L218 292L229 329L248 362L272 387L272 389L268 390L264 394L261 402L249 402L233 390L215 372L202 353L190 324L185 295L184 240L178 194L169 173L158 164L148 164L150 158L158 149L171 141L179 139Z"
        />
      </g>
      <g className="ripita-mark__layer ripita-mark__wing">
        <path
          fill="#9E1B3F"
          d="M215 258L244 260L273 268L298 280L326 301L350 328L367 356L380 394L383 424L359 425L328 419L297 406L275 391L272 386L270 386L252 367L240 350L230 331L219 297L215 258Z"
        />
      </g>
      <g className="ripita-mark__layer ripita-mark__spark">
        <path
          fill="#F47B20"
          d="M168 99L179 100L189 106L189 108L171 127L169 127L151 109L160 101L168 99Z"
        />
      </g>
    </svg>
  );
}
