type Button3DProps = {
  text: string;
};

export default function Button3D({ text }: Button3DProps) {
  return (
    <button className="btn-3d rounded-full bg-black px-6 py-3 text-white">
      {text}
    </button>
  );
}