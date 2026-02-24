// Sayfalama fonksiyonu
function paginate(items, page = 1, perPage = 10) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const total = items.length;
    const totalPages = Math.ceil(total / perPage);
    
    return {
        items: items.slice(start, end),
        page: page,
        perPage: perPage,
        total: total,
        totalPages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
}

// Sayfalama UI oluştur
function createPagination(containerId, pagination, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '<div class="flex items-center justify-between mt-6">';
    html += `<p class="text-sm text-gray-500">Toplam ${pagination.total} kayıt (Sayfa ${pagination.page}/${pagination.totalPages})</p>`;
    html += '<div class="flex gap-2">';
    
    // Önceki sayfa
    if (pagination.hasPrev) {
        html += `<button onclick="${onPageChange}(${pagination.page - 1})" class="btn-s px-4 py-2">← Önceki</button>`;
    }
    
    // Sayfa numaraları
    const start = Math.max(1, pagination.page - 2);
    const end = Math.min(pagination.totalPages, pagination.page + 2);
    
    if (start > 1) {
        html += `<button onclick="${onPageChange}(1)" class="btn-s px-4 py-2">1</button>`;
        if (start > 2) html += '<span class="px-2 py-2 text-gray-500">...</span>';
    }
    
    for (let i = start; i <= end; i++) {
        const active = i === pagination.page ? 'btn-p' : 'btn-s';
        html += `<button onclick="${onPageChange}(${i})" class="${active} px-4 py-2">${i}</button>`;
    }
    
    if (end < pagination.totalPages) {
        if (end < pagination.totalPages - 1) html += '<span class="px-2 py-2 text-gray-500">...</span>';
        html += `<button onclick="${onPageChange}(${pagination.totalPages})" class="btn-s px-4 py-2">${pagination.totalPages}</button>`;
    }
    
    // Sonraki sayfa
    if (pagination.hasNext) {
        html += `<button onclick="${onPageChange}(${pagination.page + 1})" class="btn-s px-4 py-2">Sonraki →</button>`;
    }
    
    html += '</div></div>';
    container.innerHTML += html;
}

// Kullanım örneği:
// const result = paginate(allItems, currentPage, 10);
// displayItems(result.items);
// createPagination('pagination-container', result, 'loadPage');
