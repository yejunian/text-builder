import status from "http-status";

export async function GET(_request: Request) {
  return new Response(null, { status: status.NOT_FOUND });
}

export async function POST(_request: Request) {
  return new Response(null, { status: status.NOT_FOUND });
}

export async function PUT(_request: Request) {
  return new Response(null, { status: status.NOT_FOUND });
}

export async function PATCH(_request: Request) {
  return new Response(null, { status: status.NOT_FOUND });
}

export async function DELETE(_request: Request) {
  return new Response(null, { status: status.NOT_FOUND });
}

export async function HEAD(_request: Request) {
  return new Response(null, { status: status.NOT_FOUND });
}
