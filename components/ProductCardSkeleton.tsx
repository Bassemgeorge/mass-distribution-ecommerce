export default function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-square bg-gray-100" />
      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="h-3 w-16 bg-gray-100 rounded" />
        <div className="h-4 w-3/4 bg-gray-100 rounded" />
        <div className="h-3 w-1/2 bg-gray-100 rounded" />
        <div className="h-3 w-24 bg-gray-100 rounded" />
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="h-5 w-20 bg-gray-100 rounded" />
          <div className="h-8 w-16 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
