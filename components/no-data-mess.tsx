// Common component we can add to each page:
export const NoDataMessage = () => (
    <div className="flex flex-col items-center justify-center p-8 text-gray-400 bg-gray-800/50 rounded-lg">
      <p className="text-lg">No items found</p>
      <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
    </div>
  )
