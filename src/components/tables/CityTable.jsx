import React from 'react'

export default function CityTable({ ciudades, departamento }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200 mt-8">
           {' '}
      <h2 className="text-xl font-semibold text-neutral-800 mb-4">
                Ciudades en {departamento}     {' '}
      </h2>
           {' '}
      {ciudades && ciudades.length > 0 ? (
        <div className="overflow-x-auto">
                   {' '}
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
                       {' '}
            <thead className="bg-neutral-50">
                           {' '}
              <tr>
                               {' '}
                <th
                  scope="col"
                  className="px-4 py-2 text-left font-medium text-neutral-600 uppercase tracking-wider"
                >
                                    Ciudad                {' '}
                </th>
                               {' '}
                <th
                  scope="col"
                  className="px-4 py-2 text-left font-medium text-neutral-600 uppercase tracking-wider"
                >
                                    Votos                {' '}
                </th>
                               {' '}
                <th
                  scope="col"
                  className="px-4 py-2 text-left font-medium text-neutral-600 uppercase tracking-wider"
                >
                                    Promesas                {' '}
                </th>
                               {' '}
                <th
                  scope="col"
                  className="px-4 py-2 text-left font-medium text-neutral-600 uppercase tracking-wider"
                >
                                    Potenciales                {' '}
                </th>
                             {' '}
              </tr>
                         {' '}
            </thead>
                       {' '}
            <tbody className="bg-white divide-y divide-neutral-200">
                           {' '}
              {ciudades.map((ciudad, index) => (
                <tr
                  key={index}
                  className="hover:bg-neutral-50 transition-colors duration-150"
                >
                                   {' '}
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-neutral-800">
                                        {ciudad.name}                 {' '}
                  </td>
                                   {' '}
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-600">
                                        {ciudad.votos.toLocaleString()}         
                           {' '}
                  </td>
                                   {' '}
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-600">
                                        {ciudad.promesas.toLocaleString()}     
                               {' '}
                  </td>
                                   {' '}
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-600">
                                        {ciudad.potenciales.toLocaleString()}   
                                 {' '}
                  </td>
                                 {' '}
                </tr>
              ))}
                         {' '}
            </tbody>
                     {' '}
          </table>
                 {' '}
        </div>
      ) : (
        <p className="text-neutral-500">
                    No hay datos de ciudades para este departamento.      
           {' '}
        </p>
      )}
         {' '}
    </div>
  )
}
