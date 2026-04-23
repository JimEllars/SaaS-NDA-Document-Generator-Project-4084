import fs from 'fs';
let file = fs.readFileSync('src/components/NDAGeneratorForm.jsx', 'utf8');

const checkboxToInsert = `
                <div className="flex items-center gap-3 p-4 bg-black/50 border border-white/10 rounded-xl mt-3">
                  <input
                    id="includeNonSolicitation"
                    type="checkbox"
                    name="includeNonSolicitation"
                    checked={formData.includeNonSolicitation || false}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-axim-teal border-zinc-600 rounded focus:ring-axim-teal bg-black"
                  />
                  <label htmlFor="includeNonSolicitation" className="text-sm font-medium text-zinc-300">
                    Include Non-Solicitation Clause
                  </label>
                </div>`;

file = file.replace('</label>\n                </div>\n\n                <div className="flex justify-between mt-6">', '</label>\n                </div>' + checkboxToInsert + '\n\n                <div className="flex justify-between mt-6">');

file = file.replace('<option value="10">10 Years</option>', '<option value="10">10 Years</option>\n                      <option value="Indefinitely">Indefinitely</option>');

fs.writeFileSync('src/components/NDAGeneratorForm.jsx', file);
