import { useEffect, useState } from "react";
import axios from "axios";

// Type for each stock
interface Stock {
  name: string;
  purchasePrice: number;
  quantity: number;
  ticker: string | number;
  sector: string;
  investment: number;
  cmp?: number | null;
  pe?: number | null;
  eps?: number | null;
  earning?: number | null;
  presentValue?: number | null;
  gainLoss?: number | null;
  portfolipct?: number | null;
}

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>("all");

  // Fetch portfolio data from backend
  const fetchData = async () => {
    try {
      const res = await axios.get("/api/portfolio");
      setStocks(res.data.consolidatedList);
    } catch (err) {
      console.error("Error fetching portfolio:", err);
    }
  };
  console.log('stocks',stocks);
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // refresh every 15 sec
    return () => clearInterval(interval);
  }, []);

  // Filter stocks by sector
  const filteredStocks =
    selectedSector === "all"
      ? stocks
      : stocks.filter(stock => stock.sector === selectedSector);

  // Extract unique sectors for dropdown
  const sectors = Array.from(new Set(stocks.map(s => s.sector)));

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Portfolio Dashboard</h1>

      {/* Sector Filter */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Filter by Sector:</label>
        <select
          className="border p-1 rounded"
          value={selectedSector}
          onChange={e => setSelectedSector(e.target.value)}
        >
          <option value="all">All</option>
          {sectors.map(sector => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>
      </div>

      {/* Portfolio Table */}
      <div className="overflow-x-auto">

        <table className="table-auto w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1 border">Stock Name</th>
              <th className="px-2 py-1 border">Purchase Price</th>
              <th className="px-2 py-1 border">Quantity</th>
              <th className="px-2 py-1 border">Investment</th>
              <th className="px-2 py-1 border">CMP</th>
              <th className="px-2 py-1 border">Present Value</th>
              <th className="px-2 py-1 border">Gain/Loss</th>
              <th className="px-2 py-1 border">P/E</th>
              <th className="px-2 py-1 border">EPS</th>
              <th className="px-2 py-1 border">Earnings</th>
              <th className="px-2 py-1 border">Portfolio %</th>
              <th className="px-2 py-1 border">Sector</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-2 py-1 border">{stock.name}</td>
                  <td className="px-2 py-1 border">{stock.purchasePrice}</td>
                  <td className="px-2 py-1 border">{stock.quantity}</td>
                  <td className="px-2 py-1 border">{stock.investment}</td>
                  <td className="px-2 py-1 border">{stock.cmp ?? "-"}</td>
                  <td className="px-2 py-1 border">{stock.presentValue ?? "-"}</td>
                  <td
                    className={`px-2 py-1 border ${
                      stock.gainLoss! >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stock.gainLoss ?? "-"}
                  </td>
                  <td className="px-2 py-1 border">{stock.pe ?? "-"}</td>
                  <td className="px-2 py-1 border">{stock.eps ?? "-"}</td>
                  <td className="px-2 py-1 border">{stock.earning ?? "-"}</td>
                  <td className="px-2 py-1 border">{stock.portfolipct ?? "-"}</td>
                  <td className="px-2 py-1 border">{stock.sector}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="text-center py-4">
                  No stocks available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

 
}
