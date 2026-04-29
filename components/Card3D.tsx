type Card3DProps = {
  title: string;
  subtitle: string;
};

export default function Card3D({ title, subtitle }: Card3DProps) {
  return (
    <div className="card-3d rounded-3xl border border-black/5 bg-white p-8">
      <div className="mb-4 h-52 rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-100" />
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-black/60">{subtitle}</p>
    </div>
  );
}