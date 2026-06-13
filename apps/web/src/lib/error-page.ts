export function renderErrorPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Server Error</title></head>
<body>
  <div style="display:flex;min-height:100vh;align-items:center;justify-content:center;font-family:sans-serif;">
    <div style="text-align:center;">
      <h1 style="font-size:1.5rem;font-weight:600;">500</h1>
      <p style="margin-top:0.5rem;color:#666;">Something went wrong on our end.</p>
    </div>
  </div>
</body>
</html>`;
}
