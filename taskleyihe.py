#=============================================================================================================

# import tkinter as tk
# from tkinter import messagebox, filedialog
# from tkinter import ttk
# import pandas as pd
# import math

# # Global DataFrame
# df = pd.DataFrame(columns=["Diametr (mm)", "Qalınlıq (mm)", "Layihə uzunluğu (m)", "1m Boru Çəkisi (ton)", 
#                            "Toplam Çəki (ton)", "Səth Sahəsi (m²)", "Rulon Ehtiyacı (ton)", 
#                            "Qaynaq Tel Ehtiyacı 3.2mm (kg)", "Qaynaq Tel Ehtiyacı 4.0mm (kg)", 
#                            "Adhesive Ehtiyacı (kg)", "FBE Ehtiyacı (kg)", "HDPE Ehtiyacı (kg)"])

# # Hesablama funksiyası
# def calculate_pipe_weight(diameter, thickness, project_length):
#     pi = math.pi
#     unit_weight = ((diameter - thickness) * thickness * 0.0246615) / 1000
#     total_weight = project_length * unit_weight
#     area = (diameter / 1000) * pi
#     total_area = area * project_length
#     return unit_weight, total_weight, area, total_area

# # Yeni dəyişənlər
# total_project_weight = 0
# total_project_area = 0
# total_required_adhesive = 0
# total_required_fbe = 0
# total_required_hdpe = 0
# total_required_coil = 0
# total_wire_3_2mm = 0
# total_wire_4_0mm = 0

# # Hesablama funksiyası input sahələri üçün
# def on_input_calculate():
#     try:
#         diameter = float(diameter_entry.get())
#         thickness = float(thickness_entry.get())
#         project_length = float(project_length_entry.get())
#         coil_weight = float(coil_weight_entry.get())
#         coil_width = float(coil_width_entry.get())
#         pipe_purpose = pipe_purpose_var.get()
        
#         unit_weight, total_weight, area, total_area = calculate_pipe_weight(diameter, thickness, project_length)
        
#         # Boru təyinatına görə fərqli hesablamalar
#         if pipe_purpose.lower() == "su":
#             total_skelptend = (coil_width / 1000) * (total_weight / coil_weight) * 0  # Su üçün hesablamada dəyişikliklər
#         elif pipe_purpose.lower() == "qaz":
#             total_skelptend = (coil_width / 1000) * (total_weight / coil_weight) * 1.3  # Qaz üçün hesablamada fərq
#         elif pipe_purpose.lower() == float:
#             messagebox.showerror("Xəta", f"Düzgün dəyər daxil edin!")
#         else:
#             total_skelptend = 0
        
#         pipe_waste = (12 + total_skelptend) * unit_weight
#         sheet_waste = (total_weight / coil_weight) * (7.85 * thickness / 1000 * (coil_width / 1000)) * 6
#         swarf_waste = 20 / coil_width * coil_weight * (total_weight / coil_weight)
#         total_waste = pipe_waste + sheet_waste + swarf_waste
#         steel_coil_recipe = 1 + total_waste / total_weight
        
        
#         required_adhesive = total_area * 0.3  # kg/m²
#         required_fbe = total_area * 0.2  # kg/m²
#         if diameter > 800:
#             hdpe = 4  # kg/m²
#         elif diameter < 500:
#             hdpe = 3.3  # kg/m²
#         else:
#             hdpe = 3.7  # kg/m²
#         required_hdpe = total_area * hdpe
#         required_coil = total_weight * steel_coil_recipe
        
#         if diameter <= 500 and thickness <= 8:
#             wire_3_2mm = total_weight * 1.7
#             wire_4_0mm = total_weight * 2.1
#         elif diameter > 500 and thickness > 8:
#             wire_3_2mm = total_weight * 2.0
#             wire_4_0mm = total_weight * 2.5
#         elif diameter > 500 and thickness <= 8:
#             wire_3_2mm = total_weight * 1.9
#             wire_4_0mm = total_weight * 2.3
#         else:  # diameter <= 500 and thickness > 8
#            wire_3_2mm = total_weight * 1.8
#            wire_4_0mm = total_weight * 2.2

        
#         # Dəyərləri toplama əməliyyatı
#         global total_project_weight, total_project_area, total_required_adhesive, total_required_fbe, total_required_hdpe, total_required_coil, total_wire_3_2mm, total_wire_4_0mm
#         total_project_weight += total_weight
#         total_project_area += total_area
#         total_required_adhesive += required_adhesive
#         total_required_fbe += required_fbe
#         total_required_hdpe += required_hdpe
#         total_required_coil += required_coil
#         total_wire_3_2mm += wire_3_2mm
#         total_wire_4_0mm += wire_4_0mm
        
#         # Nəticəni GUI-də göstərmək
#         result_label.config(text=f"Toplam Çəki: {total_project_weight:.2f} ton\n"
#                                f"Toplam Səth Sahəsi: {total_project_area:.2f} m²")
        
#     except ValueError as e:
#         messagebox.showerror("Xəta", f"Düzgün dəyər daxil edin!")

# # Cədvəl üçün hesablama düyməsi
# def on_table_calculate():
#     try:
#         diameter = float(diameter_entry.get())
#         thickness = float(thickness_entry.get())
#         project_length = float(project_length_entry.get())
#         coil_weight = float(coil_weight_entry.get())
#         coil_width = float(coil_width_entry.get())
#         pipe_purpose = pipe_purpose_var.get()
        
#         unit_weight, total_weight, area, total_area = calculate_pipe_weight(diameter, thickness, project_length)

        
#         # DataFrame-ə əlavə etmək
#         global df
#         df.loc[len(df)] = [diameter, thickness, project_length, unit_weight, total_weight, total_area, 
#                            total_required_coil, total_wire_3_2mm, total_wire_4_0mm, total_required_adhesive, 
#                            total_required_fbe, total_required_hdpe]
        
#         # Məlumatlar əlavə edildikdən sonra faylı yeniləmək
#         save_to_csv()
        
#         # Nəticə səhifəsini yeniləmək
#         update_result_page()
        
#         messagebox.showinfo("Hesablama tamamlandı", "Məlumatlar müvəffəqiyyətlə əlavə edildi.")
        
#     except ValueError as e:
#         messagebox.showerror("Xəta", f"Cədvələ düzgün dəyər daxil edin!")

# def reset_project():
#     # Reset all inputs and global variables
#     diameter_entry.delete(0, tk.END)
#     thickness_entry.delete(0, tk.END)
#     project_length_entry.delete(0, tk.END)
#     coil_weight_entry.delete(0, tk.END)
#     coil_width_entry.delete(0, tk.END)
#     pipe_purpose_var.set("")
#     result_label.config(text="")

#     global total_project_weight, total_project_area, total_required_adhesive, total_required_fbe
#     global total_required_hdpe, total_required_coil, total_wire_3_2mm, total_wire_4_0mm

#     total_project_weight = 0
#     total_project_area = 0
#     total_required_adhesive = 0
#     total_required_fbe = 0
#     total_required_hdpe = 0
#     total_required_coil = 0
#     total_wire_3_2mm = 0
#     total_wire_4_0mm = 0
    
# # Fayl yükləmək funksiyası
# def open_file():
#     filepath = filedialog.askopenfilename(filetypes=[("CSV Faylları", "*.csv")])
#     if filepath:
#         global df
#         df = pd.read_csv(filepath)
#         messagebox.showinfo("Fayl Yükləndi", "Fayl uğurla yükləndi.")
        
#         # Nəticə səhifəsini yeniləyin
#         update_result_page()

# # Fayl saxlamaq funksiyası
# def save_to_csv():
#     filepath = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV Faylları", "*.csv")])
#     if filepath:
#         global df
#         df.to_csv(filepath, index=False)
#         messagebox.showinfo("Fayl Saxlanıldı", "Fayl uğurla saxlanıldı.")

# # Nəticə səhifəsini yeniləmək
# def update_result_page():
#     for row in result_tree.get_children():
#         result_tree.delete(row)
    
#     for index, row in df.iterrows():
#         result_tree.insert("", "end", values=row.tolist())

# # GUI-ni yaratmaq
# def create_gui():
#     global diameter_entry, thickness_entry, project_length_entry, coil_weight_entry, coil_width_entry, pipe_purpose_var, result_label, result_tree, input_buttons_frame, table_buttons_frame

#     root = tk.Tk()
#     root.title("Boru Hesablama Proqramı")
    
#     # Notebook widget (Tablar)
#     notebook = ttk.Notebook(root)
#     notebook.pack(fill="both", expand=True)
    
#     # Hesablama səhifəsi (Tab 1)
#     input_frame = tk.Frame(notebook)
#     notebook.add(input_frame, text="Hesablama")
    
#     # Hesablama formu
#     tk.Label(input_frame, text="Diametr (mm):").grid(row=0, column=0)
#     diameter_entry = tk.Entry(input_frame)
#     diameter_entry.grid(row=0, column=1)
    
#     tk.Label(input_frame, text="Qalınlıq (mm):").grid(row=1, column=0)
#     thickness_entry = tk.Entry(input_frame)
#     thickness_entry.grid(row=1, column=1)
    
#     tk.Label(input_frame, text="Layihə uzunluğu (m):").grid(row=2, column=0)
#     project_length_entry = tk.Entry(input_frame)
#     project_length_entry.grid(row=2, column=1)
    
#     tk.Label(input_frame, text="Rulon çəkisi (ton):").grid(row=3, column=0)
#     coil_weight_entry = tk.Entry(input_frame)
#     coil_weight_entry.grid(row=3, column=1)
    
#     tk.Label(input_frame, text="Rulon genişliyi (mm):").grid(row=4, column=0)
#     coil_width_entry = tk.Entry(input_frame)
#     coil_width_entry.grid(row=4, column=1)
    
#     tk.Label(input_frame, text="Boru təyinatı (Su/Qaz):").grid(row=5, column=0)
#     pipe_purpose_var = tk.StringVar(value="su")
#     pipe_purpose_dropdown = ttk.Combobox(input_frame, textvariable=pipe_purpose_var, values=["su", "qaz"])
#     pipe_purpose_dropdown.grid(row=5, column=1)
    
#     # Hesablama düymələri üçün çərçivə
#     input_buttons_frame = tk.Frame(input_frame)
#     input_buttons_frame.grid(row=6, column=0, columnspan=2, pady=10)
#     calculate_button = tk.Button(input_buttons_frame, text="Hesabla", command=on_input_calculate)
#     calculate_button.grid(row=5, column=1, pady=10)
    
#     reset_button = ttk.Button(input_buttons_frame, text="Yeni Layihəyə Başla", command=reset_project)
#     reset_button.grid(row=6, column=1, pady=10)
    
#     # Nəticə hissəsi
#     result_label = tk.Label(input_frame, text="Hesablama nəticəsi burada göstəriləcək.", justify="left")
#     result_label.grid(row=7, column=0, columnspan=2, pady=10)
    
#     # Nəticə səhifəsi (Tab 2)
#     result_frame = tk.Frame(notebook)
#     notebook.add(result_frame, text="Nəticə")
    
#     result_tree = ttk.Treeview(result_frame, columns=df.columns.tolist(), show="headings", height=10)
#     for col in df.columns:
#         result_tree.heading(col, text=col)
#         result_tree.column(col, width=110)
#     result_tree.grid(row=1, column=0)
    
#     # Cədvəl üçün düymə
#     table_buttons_frame = tk.Frame(result_frame)
#     table_buttons_frame.grid(row=2, column=0, pady=10)
#     table_calculate_button = tk.Button(table_buttons_frame, text="Cədvəl üçün Hesabla", command=on_table_calculate)
#     table_calculate_button.grid(row=0, column=0, pady=10)
    
#     # Fayl açmaq və saxlamaq üçün düymələr
#     file_buttons_frame = tk.Frame(result_frame)
#     file_buttons_frame.grid(row=3, column=0, pady=10)
#     file_open_button = tk.Button(file_buttons_frame, text="Fayl Yüklə", command=open_file)
#     file_open_button.grid(row=0, column=0, pady=10)
#     file_save_button = tk.Button(file_buttons_frame, text="Fayl Saxla", command=save_to_csv)
#     file_save_button.grid(row=0, column=1, pady=10)
    
#     root.mainloop()

# # Proqramı başlatmaq
# create_gui()


# ===================================================================================================


import tkinter as tk
from tkinter import messagebox, filedialog, ttk
import json
import math
import pandas as pd
from PyPDF2 import PdfReader




# JSON fayllarını oxuyuruq və yoxlayırıq
try:
    with open("pipeline_data.json", "r") as file:
        data = json.load(file)  # pipeline_data.json məlumatlarını yükləyirik
except FileNotFoundError:
    data = {"pipeline_products": {"ID": {}}}  # Fayl yoxdursa, boş məlumat başlayırıq.

try:
    with open("pipeline_data_result.json", "r") as file:
        result = json.load(file)  # pipeline_data_result.json məlumatlarını yükləyirik
except FileNotFoundError:
    result = {"results": []}  # Fayl yoxdursa, boş nəticələrlə başlayırıq.




def update_result_tree(result_tree):
    """Nəticələr cədvəlini yeniləyir."""
    result_tree.delete(*result_tree.get_children())

    for entry in result["results"]:
        result_tree.insert("", "end", values=tuple(entry.values()))

def auto_update_results(result_tree):
    """Nəticələr cədvəlini avtomatik olaraq 2 saniyədən bir yeniləyir."""
    try:
        with open("pipeline_data_result.json", "r") as file:
            global result
            result = json.load(file)
    except FileNotFoundError:
        result = {"results": []}

    update_result_tree(result_tree)
    result_tree.after(2000, lambda: auto_update_results(result_tree))

def update_product_tree(product_tree):
    """Pipeline məhsullarını cədvələ yeniləyir."""
    product_tree.delete(*product_tree.get_children())

    for product_id, product in data["pipeline_products"]["ID"].items():
        name = product.get("pipeline_name", "N/A")
        stock = product.get("pipeline_stock", 0)
        product_tree.insert("", "end", values=(product_id, name, stock))

def add_product(product_id_entry, product_name_entry, quantity_entry, product_tree):
    """Yeni məhsul əlavə edir."""
    product_id = product_id_entry.get()
    name = product_name_entry.get()
    quantity = quantity_entry.get()

    if not product_id or not name or not quantity:
        messagebox.showerror("Xəta", "Bütün sahələri doldurun!")
        return

    try:
        quantity = int(quantity)
    except ValueError:
        messagebox.showerror("Xəta", "Sayı düzgün formatda olmalıdır!")
        return

    if product_id in data["pipeline_products"]["ID"]:
        messagebox.showwarning("Xəbərdarlıq", f"ID {product_id} artıq mövcuddur.")
    else:
        data["pipeline_products"]["ID"][product_id] = {
            "pipeline_name": name,
            "pipeline_stock": quantity,
        }

        with open("pipeline_data.json", "w") as outfile:
            json.dump(data, outfile, indent=4)

        update_product_tree(product_tree)

def delete_product(product_tree):
    """Seçilmiş məhsulu silir."""
    selected_item = product_tree.selection()
    if not selected_item:
        messagebox.showerror("Xəta", "Lütfən silmək üçün bir məhsul seçin.")
        return

    item = product_tree.item(selected_item)
    product_id = str(item["values"][0])  # ID-ni string formatına çevrilir

    if product_id in data["pipeline_products"]["ID"]:
        del data["pipeline_products"]["ID"][product_id]

        with open("pipeline_data.json", "w") as outfile:
            json.dump(data, outfile, indent=4)

        update_product_tree(product_tree)
        messagebox.showinfo("Məlumat", f"ID {product_id} olan məhsul uğurla silindi.")
    else:
        messagebox.showerror("Xəta", f"ID {product_id} tapılmadı.")


def add_product(product_id_entry, product_name_entry, quantity_entry, product_tree):
    """Yeni məhsul əlavə edir."""
    product_id = product_id_entry.get()
    name = product_name_entry.get()
    quantity = quantity_entry.get()

    if not product_id or not name or not quantity:
        messagebox.showerror("Xəta", "Bütün sahələri doldurun!")
        return

    try:
        quantity = int(quantity)
    except ValueError:
        messagebox.showerror("Xəta", "Sayı düzgün formatda olmalıdır!")
        return

    if product_id in data["pipeline_products"]["ID"]:
        messagebox.showwarning("Xəbərdarlıq", f"ID {product_id} artıq mövcuddur.")
    else:
        data["pipeline_products"]["ID"][product_id] = {
            "pipeline_name": name,
            "pipeline_stock": quantity,
        }

        with open("pipeline_data.json", "w") as outfile:
            json.dump(data, outfile, indent=4)

        update_product_tree(product_tree)

def delete_product(product_tree):
    """Seçilmiş məhsulu silir."""
    selected_item = product_tree.selection()
    if not selected_item:
        messagebox.showerror("Xəta", "Lütfən silmək üçün bir məhsul seçin.")
        return

    item = product_tree.item(selected_item)
    product_id = str(item["values"][0])  # ID-ni string formatına çevrilir

    if product_id in data["pipeline_products"]["ID"]:
        del data["pipeline_products"]["ID"][product_id]

        with open("pipeline_data.json", "w") as outfile:
            json.dump(data, outfile, indent=4)

        update_product_tree(product_tree)
        messagebox.showinfo("Məlumat", f"ID {product_id} olan məhsul uğurla silindi.")
    else:
        messagebox.showerror("Xəta", f"ID {product_id} tapılmadı.")

def edit_product(product_tree, product_id_entry, product_name_entry, quantity_entry):
    """Seçilmiş məhsulu redaktə edir."""
    selected_item = product_tree.selection()
    if not selected_item:
        messagebox.showerror("Xəta", "Lütfən redaktə etmək üçün bir məhsul seçin.")
        return

    item = product_tree.item(selected_item)
    product_id = str(item["values"][0])  # ID-ni string formatına çevrilir

    if product_id not in data["pipeline_products"]["ID"]:
        messagebox.showerror("Xəta", f"ID {product_id} tapılmadı.")
        return

    # Yeni məlumatları alırıq
    new_name = product_name_entry.get()
    new_quantity = quantity_entry.get()

    if not new_name or not new_quantity:
        messagebox.showerror("Xəta", "Bütün sahələri doldurun!")
        return

    try:
        new_quantity = int(new_quantity)
    except ValueError:
        messagebox.showerror("Xəta", "Sayı düzgün formatda olmalıdır!")
        return

    # Məhsulu yeniləyirik
    data["pipeline_products"]["ID"][product_id]["pipeline_name"] = new_name
    data["pipeline_products"]["ID"][product_id]["pipeline_stock"] = new_quantity

    # JSON faylını yeniləyirik
    with open("pipeline_data.json", "w") as outfile:
        json.dump(data, outfile, indent=4)

    update_product_tree(product_tree)
    messagebox.showinfo("Məlumat", f"ID {product_id} olan məhsul uğurla redaktə edildi.")


def calculate_pipe_weight(diameter, thickness, project_length):
    pi = math.pi
    unit_weight = ((diameter - thickness) * thickness * 0.0246615) / 1000
    total_weight = project_length * unit_weight
    area = (diameter / 1000) * pi
    total_area = area * project_length
    return unit_weight, total_weight, area, total_area

def clear_inputs(entries):
    """Bütün daxil edilmiş sahələri təmizləyir."""
    for entry in entries:
        entry.delete(0, tk.END)

def on_input_calculate(diameter_entry, thickness_entry, project_length_entry, coil_weight_entry, coil_width_entry, pipe_purpose_var, result_label):
    try:
        diameter = float(diameter_entry.get())
        thickness = float(thickness_entry.get())
        project_length = float(project_length_entry.get())
        coil_weight = float(coil_weight_entry.get())
        coil_width = float(coil_width_entry.get())
        pipe_purpose = pipe_purpose_var.get()

        unit_weight, total_weight, area, total_area = calculate_pipe_weight(diameter, thickness, project_length)

        if pipe_purpose.lower() == "su":
            total_skelptend = (coil_width / 1000) * (total_weight / coil_weight) * 0
        elif pipe_purpose.lower() == "qaz":
            total_skelptend = (coil_width / 1000) * (total_weight / coil_weight) * 1.3
        else:
            total_skelptend = 0

        pipe_waste = (12 + total_skelptend) * unit_weight
        sheet_waste = (total_weight / coil_weight) * (7.85 * thickness / 1000 * (coil_width / 1000)) * 6
        swarf_waste = 20 / coil_width * coil_weight * (total_weight / coil_weight)
        total_waste = pipe_waste + sheet_waste + swarf_waste
        steel_coil_recipe = 1 + total_waste / total_weight

        required_adhesive = round(total_area * 0.3, 2)
        required_fbe = round(total_area * 0.2, 2)
        if diameter > 800:
            hdpe = 4
        elif diameter < 500:
            hdpe = 3.3
        else:
            hdpe = 3.7
        required_hdpe = round(total_area * hdpe, 2)
        required_coil = round(total_weight * steel_coil_recipe, 2)

        if diameter <= 500 and thickness <= 8:
            wire_3_2mm = round(total_weight * 1.7, 2)
            wire_4_0mm = round(total_weight * 2.1, 2)
        elif diameter > 500 and thickness > 8:
            wire_3_2mm = round(total_weight * 2.0, 2)
            wire_4_0mm = round(total_weight * 2.5, 2)
        elif diameter > 500 and thickness <= 8:
            wire_3_2mm = round(total_weight * 1.9, 2)
            wire_4_0mm = round(total_weight * 2.3, 2)
        else:
            wire_3_2mm = round(total_weight * 1.8, 2)
            wire_4_0mm = round(total_weight * 2.2, 2)

        # Hesablama nəticəsi obyektini yaradırıq
        new_result = {
            "diameter": round(diameter, 2),
            "thickness": round(thickness, 2),
            "project_length": round(project_length, 2),
            "coil_weight": round(coil_weight, 2),
            "coil_width": round(coil_width, 2),
            "pipe_purpose": pipe_purpose,
            "total_weight": round(total_weight, 2),
            "total_area": round(total_area, 2),
            "required_adhesive": required_adhesive,
            "required_fbe": required_fbe,
            "required_hdpe": required_hdpe,
            "required_coil": required_coil,
            "wire_3_2mm": wire_3_2mm,
            "wire_4_0mm": wire_4_0mm
        }

        # `results` açarının mövcudluğunu yoxlayırıq
        if "results" not in result:
            result["results"] = []

        # Yeni nəticəni əlavə edirik
        result["results"].append(new_result)

        # JSON faylını yeniləyirik
        with open("pipeline_data_result.json", "w") as outfile:
            json.dump(result, outfile, indent=4)

        # GUI-də nəticəni göstəririk
        result_label.config(text=f"Toplam Çəki: {total_weight:.2f} ton\n"
                                 f"Toplam Səth Sahəsi: {total_area:.2f} m²\n"
                                 f"Adhesive: {required_adhesive:.2f} kg\n"
                                 f"FBE: {required_fbe:.2f} kg\n"
                                 f"HDPE: {required_hdpe:.2f} kg\n"
                                 f"Rulon Ehtiyacı: {required_coil:.2f} ton\n"
                                 f"3.2mm Tel Ehtiyacı: {wire_3_2mm:.2f} kg\n"
                                 f"4.0mm Tel Ehtiyacı: {wire_4_0mm:.2f} kg")
    except ValueError as e:
        messagebox.showerror(e,f"Xəta", f"Düzgün dəyər daxil edin!")

def load_excel_file(product_tree):
    """Excel faylını yükləyir və məlumatları məhsullar siyahısına əlavə edir."""
    file_path = filedialog.askopenfilename(filetypes=[("Excel Files", "*.xlsx *.xls")])
    if not file_path:
        return

    try:
        df = pd.read_excel(file_path)
        for _, row in df.iterrows():
            product_id = str(row["ID"])
            name = row["Name"]
            stock = int(row["Stock"])

            if product_id in data["pipeline_products"]["ID"]:
                messagebox.showwarning("Xəbərdarlıq", f"ID {product_id} artıq mövcuddur.")
            else:
                data["pipeline_products"]["ID"][product_id] = {
                    "pipeline_name": name,
                    "pipeline_stock": stock,
                }

        with open("pipeline_data.json", "w") as outfile:
            json.dump(data, outfile, indent=4)

        update_product_tree(product_tree)
        messagebox.showinfo("Məlumat", "Excel məlumatları uğurla yükləndi.")
    except Exception as e:
        messagebox.showerror("Xəta", f"Faylı yükləmək mümkün olmadı: {e}")

def clear_results(result_tree):
    """Nəticələr cədvəlini təmizləyir."""
    global result
    result["results"] = []
    update_result_tree(result_tree)
    with open("pipeline_data_result.json", "w") as file:
        json.dump(result, file, indent=4)
    messagebox.showinfo("Məlumat", "Cədvəl təmizləndi.")

def delete_row(tree, selected_item):
    """Seçilmiş məlumatı silir."""
    if not selected_item:
        messagebox.showerror("Xəta", "Lütfən silmək üçün bir sətir seçin.")
        return

    tree.delete(selected_item)
    # Lazım olsa JSON və ya digər saxlanılan məlumatları da yeniləyə bilərsiniz.


def populate_result_table(tree, data):
    """Cədvələ məlumatları doldurur və hər birinə X düyməsi əlavə edir."""
    for row in data:
        # Məlumatı cədvələ əlavə et
        item_id = tree.insert("", "end", values=row)

        # "X" düyməsi üçün Frame yarat
        btn_frame = tk.Frame(tree)
        delete_btn = tk.Button(btn_frame, text="X", command=lambda item=item_id: delete_row(tree, item))
        delete_btn.pack()

        # "X" düyməsini sətirə əlavə et
        tree.item(item_id, tags=("button",))
        tree.tag_bind("button", "<Button-1>", lambda event: delete_btn.invoke())


def create_gui():
    """Qrafik interfeysi yaradır."""
    root = tk.Tk()
    root.title("Boru Layihələri Hesablama Proqramı")

    notebook = ttk.Notebook(root)
    notebook.pack(fill="both", expand=True)

    # Hesablama Tab
    calculate_tab = tk.Frame(notebook)
    notebook.add(calculate_tab, text="Hesablama")
    tk.Label(calculate_tab, text="Hesablama", font=("Arial", 14)).pack(pady=10)

    input_frame = tk.Frame(calculate_tab)
    input_frame.pack(pady=10)

    diameter_entry = tk.Entry(input_frame)
    thickness_entry = tk.Entry(input_frame)
    project_length_entry = tk.Entry(input_frame)
    coil_weight_entry = tk.Entry(input_frame)
    coil_width_entry = tk.Entry(input_frame)
    pipe_purpose_var = tk.StringVar(value="su")

    tk.Label(input_frame, text="Diametr (mm):").grid(row=0, column=0)
    diameter_entry.grid(row=0, column=1)

    tk.Label(input_frame, text="Qalınlıq (mm):").grid(row=1, column=0)
    thickness_entry.grid(row=1, column=1)

    tk.Label(input_frame, text="Layihə uzunluğu (m):").grid(row=2, column=0)
    project_length_entry.grid(row=2, column=1)

    tk.Label(input_frame, text="Rulon çəkisi (ton):").grid(row=3, column=0)
    coil_weight_entry.grid(row=3, column=1)

    tk.Label(input_frame, text="Rulon genişliyi (mm):").grid(row=4, column=0)
    coil_width_entry.grid(row=4, column=1)

    tk.Label(input_frame, text="Boru təyinatı (Su/Qaz):").grid(row=5, column=0)
    pipe_purpose_dropdown = ttk.Combobox(input_frame, textvariable=pipe_purpose_var, values=["su", "qaz"])
    pipe_purpose_dropdown.grid(row=5, column=1)

    result_label = tk.Label(input_frame, text="Hesablama nəticəsi burada göstəriləcək.", justify="left")
    result_label.grid(row=7, column=0, columnspan=2, pady=10)

    calculate_button = tk.Button(
        input_frame,
        text="Hesabla",
        command=lambda: on_input_calculate(diameter_entry, thickness_entry, project_length_entry, coil_weight_entry, coil_width_entry, pipe_purpose_var, result_label)
    )
    calculate_button.grid(row=6, column=1, pady=10)

    # Yeni layihəyə başla düyməsi
    clear_button = tk.Button(
        input_frame,
        text="Yeni Layihəyə Başla",
        command=lambda: clear_inputs([diameter_entry, thickness_entry, project_length_entry, coil_weight_entry, coil_width_entry])
    )
    clear_button.grid(row=6, column=0, pady=10)

    # Məhsullar Tab
    product_tab = tk.Frame(notebook)
    notebook.add(product_tab, text="Məhsullar")

    tk.Label(product_tab, text="Məhsul İdarəsi", font=("Arial", 14)).pack(pady=10)

    product_tree = ttk.Treeview(product_tab, columns=["ID", "Name", "Stock"], show="headings")
    product_tree.heading("ID", text="ID")
    product_tree.heading("Name", text="Məhsul Adı")
    product_tree.heading("Stock", text="Stok Miqdarı")
    product_tree.pack(fill="both", expand=True)

    update_product_tree(product_tree)

    input_frame = tk.Frame(product_tab)
    input_frame.pack(pady=10)

    tk.Label(input_frame, text="Məhsul ID:").grid(row=0, column=0)
    product_id_entry = tk.Entry(input_frame)
    product_id_entry.grid(row=0, column=1)

    tk.Label(input_frame, text="Məhsul Adı:").grid(row=1, column=0)
    product_name_entry = tk.Entry(input_frame)
    product_name_entry.grid(row=1, column=1)

    tk.Label(input_frame, text="Sayı:").grid(row=2, column=0)
    quantity_entry = tk.Entry(input_frame)
    quantity_entry.grid(row=2, column=1)

    add_button = tk.Button(
        input_frame,
        text="Əlavə Et",
        command=lambda: add_product(product_id_entry, product_name_entry, quantity_entry, product_tree)
    )
    add_button.grid(row=3, column=0, pady=5)
    
    edit_button = tk.Button(
        input_frame,
        text="Redaktə et",
        command=lambda: edit_product(product_tree, product_id_entry, product_name_entry, quantity_entry)
    )
    edit_button.grid(row=3, column=2, pady=10)
    
    delete_button = tk.Button(
        input_frame,
        text="Sil",
        command=lambda: delete_product(product_tree)
    )
    delete_button.grid(row=3, column=1, pady=5)
    
    # Yükləmə düymələri
    load_excel_button = tk.Button(product_tab, text="Excel Yüklə", command=lambda: load_excel_file(product_tree))
    load_excel_button.pack(pady=5)



    # Nəticələr Tab
    result_tab = tk.Frame(notebook)
    notebook.add(result_tab, text="Nəticələr")

    tk.Label(result_tab, text="Nəticələr", font=("Arial", 14)).pack(pady=10)

    result_tree = ttk.Treeview(result_tab, columns=[
        "diameter", "thickness", "project_length", "coil_weight", "coil_width",
        "pipe_purpose", "total_weight", "total_area", "adhesive", "fbe",
        "hdpe", "coil", "wire_3_2mm", "wire_4_0mm"
    ], show="headings")

    for col in [
        "diameter", "thickness", "project_length", "coil_weight", "coil_width",
        "pipe_purpose", "total_weight", "total_area", "adhesive", "fbe",
        "hdpe", "coil", "wire_3_2mm", "wire_4_0mm"
    ]:
        result_tree.heading(col, text=col.replace("_", " ").capitalize())
        result_tree.column(col, anchor="center")

    result_tree.pack(fill="both", expand=True)
    
    auto_update_results(result_tree)  # Avtomatik yenilənməni işə salırıq
    
    # Məlumatı doldurmaq üçün nümunə
    example_data = [
        [1, "Məhsul A", "Uğurlu"],
        [2, "Məhsul B", "Uğursuz"],
        [3, "Məhsul C", "Gözlənilir"],
    ]

    populate_result_table(result_tree, example_data)
    
    
    # Fayl Yüklə və Cədvəli Təmizlə düymələri
    buttons_frame = tk.Frame(result_tab)
    buttons_frame.pack(pady=10)

    clear_button = tk.Button(buttons_frame, text="Cədvəli Boşalt", command=lambda: clear_results(result_tree))
    clear_button.grid(row=0, column=1, padx=5)

    root.mainloop()

create_gui()
# =====================================================================================
