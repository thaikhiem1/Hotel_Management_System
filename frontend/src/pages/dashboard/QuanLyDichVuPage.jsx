import { useState, useMemo, useEffect } from "react";
import { cn } from "@/utils/lib/util";
import { usePermission } from "@/utils/usePermission";
import ServiceModal from "@/components/service-management/ServiceModal";
import CategoryModal from "@/components/service-management/CategoryModal";
import { GenericDeleteDialog, Pagination } from "@/components/shared";
import { serviceAPI, serviceCategoryAPI } from "@/services/api";

const toServiceViewModel = (service) => ({
  serviceId: service.serviceId,
  serviceCateroriesId:
    service.serviceCateroriesId ?? service.serviceCategoryId,
  serviceName: service.serviceName,
  serviceCategoryName: service.serviceCategoryName,
  unitPrice: service.unitPrice,
  unit: service.unit,
  stockQuality: service.stockQuality ?? service.stockQuantity ?? null,
  isActive: service.isActive ?? true,
});

const getApiErrorMessage = (error, fallbackMessage) => {
  const responseData = error.response?.data;
  if (responseData?.fieldErrors) {
    return Object.values(responseData.fieldErrors).join("\n");
  }
  return responseData?.message || fallbackMessage;
};

const QuanLyDichVuPage = () => {
  const { check: checkWrite } = usePermission("services");
  const { canView: canViewCategories } = usePermission("serviceCategories");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] =
    useState(false);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedCategoryToDelete, setSelectedCategoryToDelete] =
    useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [serviceCategories, setServiceCategories] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingServiceDetails, setIsLoadingServiceDetails] = useState(false);
  const [error, setError] = useState(null);

  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [categoryData, serviceResponse] = await Promise.all([
        serviceCategoryAPI.getAll(),
        serviceAPI.getAll(),
      ]);

      const serviceData = serviceResponse.map(toServiceViewModel);

      setServiceCategories(categoryData);
      setServices(serviceData);
    } catch (err) {
      console.error("Error fetching service data:", err);
      setError("Không thể tải dữ liệu dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // FILTER SERVICES

  const filteredServices = useMemo(() => {
    let result = services;

    // Filter theo category
    if (selectedCategory !== "all") {
      result = result.filter(
        (service) =>
          Number(service.serviceCateroriesId) === Number(selectedCategory),
      );
    }

    // Search theo tên dịch vụ hoặc tên category
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      result = result.filter(
        (service) =>
          service.serviceName?.toLowerCase().includes(query) ||
          service.serviceCategoryName?.toLowerCase().includes(query),
      );
    }

    return result;
  }, [services, selectedCategory, searchQuery]);

  const { paginatedServices, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    return {
      paginatedServices: filteredServices.slice(
        startIndex,
        startIndex + itemsPerPage,
      ),
      totalPages: Math.ceil(filteredServices.length / itemsPerPage),
    };
  }, [filteredServices, currentPage]);

  const stats = useMemo(() => {
    const servicesWithStock = services.filter(
      (service) => service.stockQuality !== null,
    );

    return {
      total: services.length,
      categories: serviceCategories.length,

      totalValue: services.reduce(
        (sum, service) => sum + Number(service.unitPrice || 0),
        0,
      ),

      inStock: servicesWithStock.reduce(
        (sum, service) => sum + Number(service.stockQuality || 0),
        0,
      ),
    };
  }, [services, serviceCategories]);

  const handleAddService = async (data) => {
    try {
      setIsSubmitting(true);
      const createdService = await serviceAPI.create(data);
      setServices((prev) => [...prev, toServiceViewModel(createdService)]);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Error adding service:", err);
      alert(getApiErrorMessage(err, "Không thể thêm dịch vụ. Vui lòng thử lại."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditService = async (data) => {
    try {
      setIsSubmitting(true);
      const updatedService = await serviceAPI.update(selectedService.serviceId, data);

      setServices((prev) =>
        prev.map((service) =>
          service.serviceId === selectedService.serviceId
            ? toServiceViewModel(updatedService)
            : service,
        ),
      );

      setIsEditModalOpen(false);
      setSelectedService(null);
    } catch (err) {
      console.error("Error updating service:", err);
      alert(getApiErrorMessage(err, "Không thể cập nhật dịch vụ. Vui lòng thử lại."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async () => {
    try {
      setIsSubmitting(true);
      await serviceAPI.delete(selectedService.serviceId);

      setServices((prev) =>
        prev.filter(
          (service) => service.serviceId !== selectedService.serviceId,
        ),
      );

      setIsDeleteModalOpen(false);
      setSelectedService(null);
    } catch (err) {
      console.error("Error deleting service:", err);
      alert(getApiErrorMessage(err, "Không thể xóa dịch vụ. Vui lòng thử lại."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditService = async (service) => {
    if (!checkWrite()) return;
    try {
      setIsLoadingServiceDetails(true);
      const serviceDetails = await serviceAPI.getById(service.serviceId);
      setSelectedService(toServiceViewModel(serviceDetails));
      setIsEditModalOpen(true);
    } catch (err) {
      console.error("Error fetching service details:", err);
      alert(getApiErrorMessage(err, "Không thể tải thông tin dịch vụ. Vui lòng thử lại."));
    } finally {
      setIsLoadingServiceDetails(false);
    }
  };

  const handleAddCategory = async (categoryName) => {
    try {
      const newCategory = await serviceCategoryAPI.create({
        serviceCategoryName: categoryName,
      });

      setServiceCategories((prev) => [...prev, newCategory]);
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error("Error adding category:", err);
      alert("Không thể thêm loại dịch vụ. Vui lòng thử lại.");
    }
  };

  const handleEditCategory = async (id, categoryName) => {
    try {
      const updatedCategory = await serviceCategoryAPI.update(id, {
        serviceCategoryName: categoryName,
      });

      setServiceCategories((prev) =>
        prev.map((category) =>
          category.serviceCategoryId === id ? updatedCategory : category,
        ),
      );

      // Cập nhật luôn categoryName trên các service đang hiển thị
      setServices((prev) =>
        prev.map((service) =>
          Number(service.serviceCateroriesId) === Number(id)
            ? {
                ...service,
                serviceCategoryName: updatedCategory.serviceCategoryName,
              }
            : service,
        ),
      );
    } catch (err) {
      console.error("Error updating category:", err);
      alert("Không thể cập nhật loại dịch vụ. Vui lòng thử lại.");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const categoryId = selectedCategoryToDelete.serviceCategoryId;

      await serviceCategoryAPI.delete(categoryId);

      setServiceCategories((prev) =>
        prev.filter((category) => category.serviceCategoryId !== categoryId),
      );

      setSelectedCategory("all");
      setIsDeleteCategoryModalOpen(false);
      setSelectedCategoryToDelete(null);
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Không thể xóa loại dịch vụ. Vui lòng thử lại.");
    }
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="w-full space-y-space-lg">
      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-space-md">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />

            <p className="font-body-lg text-on-surface-variant">
              Đang tải dữ liệu...
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-error/10 border-2 border-error rounded-lg p-space-lg">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-error text-[32px]">
              error
            </span>

            <div>
              <p className="font-title-lg font-semibold text-error">Lỗi</p>

              <p className="font-body-md text-on-surface">{error}</p>
            </div>
          </div>

          <button
            onClick={fetchData}
            className="mt-space-md px-space-lg py-space-md rounded-lg bg-error hover:bg-error/80 text-on-error font-label-md font-semibold transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold mb-space-xs">
                Quản lý dịch vụ
              </h1>

              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Quản lý các dịch vụ bổ sung cho khách hàng
              </p>
            </div>

            <div className="flex flex-wrap gap-space-md">
              {canViewCategories && (
              <button
                onClick={() => checkWrite() && setIsCategoryModalOpen(true)}
                className="flex items-center gap-space-sm px-space-lg py-space-md rounded-lg bg-secondary hover:bg-secondary/80 text-on-secondary font-label-lg font-semibold transition-colors shadow-md"
              >
                <span className="material-symbols-outlined text-[24px]">
                  category
                </span>

                <span>Quản lý loại dịch vụ</span>
              </button>
              )}

              <button
                onClick={() => checkWrite() && setIsAddModalOpen(true)}
                className="flex items-center gap-space-sm px-space-lg py-space-md rounded-lg bg-primary hover:bg-primary/80 text-on-primary font-label-lg font-semibold transition-colors shadow-md"
              >
                <span className="material-symbols-outlined text-[24px]">
                  add_circle
                </span>

                <span>Thêm dịch vụ</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
            <div className="p-space-lg rounded-lg bg-gradient-to-br from-brand-light to-brand-dark shadow-lg">
              <div className="flex items-center gap-space-md">
                <span className="material-symbols-outlined text-white text-[32px]">
                  room_service
                </span>

                <div>
                  <p className="font-label-sm text-white/80 uppercase tracking-wide">
                    Tổng dịch vụ
                  </p>

                  <p className="font-headline-lg font-bold text-white">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            {canViewCategories && (
            <div className="p-space-lg rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg">
              <div className="flex items-center gap-space-md">
                <span className="material-symbols-outlined text-white text-[32px]">
                  category
                </span>

                <div>
                  <p className="font-label-sm text-white/80 uppercase tracking-wide">
                    Loại dịch vụ
                  </p>

                  <p className="font-headline-lg font-bold text-white">
                    {stats.categories}
                  </p>
                </div>
              </div>
            </div>
            )}

            <div className="p-space-lg rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg">
              <div className="flex items-center gap-space-md">
                <span className="material-symbols-outlined text-white text-[32px]">
                  payments
                </span>

                <div>
                  <p className="font-label-sm text-white/80 uppercase tracking-wide">
                    Tổng giá trị
                  </p>

                  <p className="font-headline-md font-bold text-white">
                    {(stats.totalValue / 1000000).toFixed(1)}tr
                  </p>
                </div>
              </div>
            </div>

            <div className="p-space-lg rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg">
              <div className="flex items-center gap-space-md">
                <span className="material-symbols-outlined text-white text-[32px]">
                  inventory
                </span>

                <div>
                  <p className="font-label-sm text-white/80 uppercase tracking-wide">
                    Tồn kho
                  </p>

                  <p className="font-headline-lg font-bold text-white">
                    {stats.inStock}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>

            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-space-lg py-space-md rounded-lg border-2 border-outline bg-surface text-on-surface font-body-md focus:border-primary focus:outline-none"
            />
          </div>

          {/* Category Tabs */}
          {canViewCategories && (
          <div className="flex gap-space-md overflow-x-auto pb-space-xs scrollbar-hide">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setCurrentPage(1);
              }}
              className={cn(
                "flex items-center gap-space-sm px-space-lg py-space-md rounded-full whitespace-nowrap font-label-lg font-semibold transition-all shadow-md",
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-brand-light to-brand-dark text-white"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              <span className="material-symbols-outlined text-[20px]">
                apps
              </span>

              <span>Tất cả</span>

              <span
                className={cn(
                  "px-space-sm py-space-xs rounded-full text-label-sm font-bold",
                  selectedCategory === "all"
                    ? "bg-white/20 text-white"
                    : "bg-surface-container-highest",
                )}
              >
                {services.length}
              </span>
            </button>

            {serviceCategories.map((category) => {
              const serviceCount = services.filter(
                (service) =>
                  Number(service.serviceCateroriesId) ===
                  Number(category.serviceCategoryId),
              ).length;

              return (
                <button
                  key={category.serviceCategoryId}
                  onClick={() => {
                    setSelectedCategory(String(category.serviceCategoryId));
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "flex items-center gap-space-sm px-space-lg py-space-md rounded-full whitespace-nowrap font-label-lg font-semibold transition-all shadow-md",
                    selectedCategory === String(category.serviceCategoryId)
                      ? "bg-gradient-to-r from-brand-light to-brand-dark text-white"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high",
                  )}
                >
                  <span>{category.serviceCategoryName}</span>

                  <span
                    className={cn(
                      "px-space-sm py-space-xs rounded-full text-label-sm font-bold",
                      selectedCategory === String(category.serviceCategoryId)
                        ? "bg-white/20 text-white"
                        : "bg-surface-container-highest",
                    )}
                  >
                    {serviceCount}
                  </span>
                </button>
              );
            })}
          </div>
          )}

          {/* Table */}
          <div className="rounded-lg border-2 border-outline-variant overflow-x-auto bg-surface shadow-lg">
            <table className="w-full min-w-[720px]">
              <thead className="bg-gradient-to-r from-surface-container-low to-surface-container">
                <tr>
                  <th className="px-space-lg py-space-md text-left font-label-lg text-on-surface uppercase tracking-wide">
                    Tên dịch vụ
                  </th>

                  <th className="px-space-lg py-space-md text-left font-label-lg text-on-surface uppercase tracking-wide">
                    Loại dịch vụ
                  </th>

                  <th className="px-space-lg py-space-md text-right font-label-lg text-on-surface uppercase tracking-wide">
                    Đơn giá
                  </th>

                  <th className="px-space-lg py-space-md text-center font-label-lg text-on-surface uppercase tracking-wide">
                    Đơn vị
                  </th>

                  <th className="px-space-lg py-space-md text-center font-label-lg text-on-surface uppercase tracking-wide">
                    Số lượng tồn
                  </th>

                  <th className="px-space-lg py-space-md text-center font-label-lg text-on-surface uppercase tracking-wide">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline-variant">
                {paginatedServices.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-space-lg py-space-xl text-center text-on-surface-variant"
                    >
                      Không tìm thấy dịch vụ
                    </td>
                  </tr>
                ) : (
                  paginatedServices.map((service) => (
                    <tr
                      key={service.serviceId}
                      className="hover:bg-surface-container-low/50 transition-colors"
                    >
                      <td className="px-space-lg py-space-lg">
                        <p className="font-title-md font-semibold text-on-surface">
                          {service.serviceName}
                        </p>
                        {service.isActive === false && (
                          <span className="inline-flex mt-space-xs px-space-sm py-space-xs rounded-full bg-outline/20 text-on-surface-variant font-label-sm font-semibold">
                            Ngừng cung cấp
                          </span>
                        )}
                      </td>

                      <td className="px-space-lg py-space-lg">
                        <span className="inline-flex px-space-md py-space-sm rounded-full bg-secondary/20 text-secondary font-label-sm font-semibold">
                          {service.serviceCategoryName || "N/A"}
                        </span>
                      </td>

                      <td className="px-space-lg py-space-lg text-right">
                        <p className="font-title-md font-bold text-primary">
                          {Number(service.unitPrice || 0).toLocaleString(
                            "vi-VN",
                          )}
                          đ
                        </p>
                      </td>

                      <td className="px-space-lg py-space-lg text-center">
                        <span className="inline-flex px-space-md py-space-sm rounded-full bg-primary/10 text-primary font-label-sm font-semibold">
                          {service.unit}
                        </span>
                      </td>

                      <td className="px-space-lg py-space-lg text-center">
                        <span
                          className={cn(
                            "inline-flex px-space-md py-space-sm rounded-full font-label-sm font-bold",
                            service.stockQuality === null
                              ? "bg-surface-container text-on-surface-variant"
                              : service.stockQuality > 50
                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                : service.stockQuality > 0
                                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                  : "bg-error/20 text-error",
                          )}
                        >
                          {service.stockQuality === null
                            ? "N/A"
                            : service.stockQuality}
                        </span>
                      </td>

                      <td className="px-space-lg py-space-lg">
                        <div className="flex items-center justify-center gap-space-sm">
                          <button
                            onClick={() => handleOpenEditService(service)}
                            disabled={isLoadingServiceDetails}
                            className="p-space-md rounded-lg bg-blue-500/20 hover:bg-blue-500 text-blue-700 dark:text-blue-300 hover:text-white transition-all shadow-md"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              edit
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              if (!checkWrite()) return;
                              setSelectedService(service);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-space-md rounded-lg bg-error/20 hover:bg-error text-error hover:text-on-error transition-all shadow-md"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            page={currentPage - 1}
            totalPages={totalPages}
            totalElements={filteredServices.length}
            pageSize={itemsPerPage}
            onPageChange={(p) => setCurrentPage(p + 1)}
            unit="dịch vụ"
          />

          {/* Service Modals */}
          <ServiceModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddService}
            serviceCategories={serviceCategories}
            mode="add"
            isSubmitting={isSubmitting}
          />

          <ServiceModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedService(null);
            }}
            onSubmit={handleEditService}
            serviceCategories={serviceCategories}
            mode="edit"
            initialData={selectedService}
            isSubmitting={isSubmitting}
          />

          <GenericDeleteDialog
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedService(null);
            }}
            onConfirm={handleDeleteService}
            title="Xóa dịch vụ"
            itemName="dịch vụ"
            itemDetails={[{ label: "Tên dịch vụ", value: selectedService?.serviceName, highlight: true }]}
          />

          {/* Category Modal */}
          <CategoryModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            categories={serviceCategories}
            onDeleteCategory={(category) => {
              setSelectedCategoryToDelete(category);
              setIsDeleteCategoryModalOpen(true);
            }}
          />

          <GenericDeleteDialog
            isOpen={isDeleteCategoryModalOpen}
            onClose={() => {
              setIsDeleteCategoryModalOpen(false);
              setSelectedCategoryToDelete(null);
            }}
            onConfirm={handleDeleteCategory}
            title="Xóa loại dịch vụ"
            itemName="loại dịch vụ"
            itemDetails={[{ label: "Tên loại", value: selectedCategoryToDelete?.serviceCategoryName, highlight: true }]}
          />
        </>
      )}
    </div>
  );
};

export default QuanLyDichVuPage;
