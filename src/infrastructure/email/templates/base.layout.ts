export function baseLayout(title: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: sans-serif; background: #f4f4f4; padding: 20px; }
        .card { background: #fff; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; }
        .btn { display: inline-block; padding: 10px 20px; color: #fff; background: #007bff; text-decoration: none; border-radius: 5px; }
      footer {
            text-align: center;
            display: block;
            color: #666; 
        }
        </style>
    </head>
    <body>
      <div class="card">
        ${content}
      </div>
      <footer>@engineofsainzo</footer>
    </body>
    </html>
  `;
}
