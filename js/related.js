(function () {
    var el = document.getElementById('related-articles');
    if (!el) return;
    var currentSlug = el.dataset.slug || '';

    var colorMap = {
        emerald: { badge: 'text-emerald-400', link: 'text-emerald-500 hover:text-emerald-400', hover: 'group-hover:text-emerald-400' },
        teal:    { badge: 'text-teal-400',    link: 'text-teal-500 hover:text-teal-400',       hover: 'group-hover:text-teal-400' },
        lime:    { badge: 'text-lime-400',    link: 'text-lime-500 hover:text-lime-400',        hover: 'group-hover:text-lime-400' },
        orange:  { badge: 'text-orange-400',  link: 'text-orange-500 hover:text-orange-400',   hover: 'group-hover:text-orange-400' },
        purple:  { badge: 'text-purple-400',  link: 'text-purple-500 hover:text-purple-400',   hover: 'group-hover:text-purple-400' },
        blue:    { badge: 'text-blue-400',    link: 'text-blue-500 hover:text-blue-400',        hover: 'group-hover:text-blue-400' },
    };

    function card(a) {
        var c = colorMap[a.categoryColor] || colorMap.emerald;
        var thumb = a.image
            ? '<img src="' + a.image + '" alt="' + a.title + '" class="w-full h-full object-cover" loading="lazy">' +
              '<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-3">' +
              '<span class="text-xs font-bold ' + c.badge + ' uppercase tracking-wider">' + a.category + '</span></div>'
            : '<div class="absolute inset-0 bg-gradient-to-br ' + a.iconBg + ' flex items-center justify-center">' +
              '<i class="fas ' + a.icon + ' text-5xl text-white opacity-20"></i></div>' +
              '<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-3">' +
              '<span class="text-xs font-bold ' + c.badge + ' uppercase tracking-wider">' + a.category + '</span></div>';

        return '<article class="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden group flex flex-col hover:border-slate-600 transition-all duration-300">' +
            '<a href="' + a.url + '" class="block"><div class="relative h-40 overflow-hidden">' + thumb + '</div></a>' +
            '<div class="p-5 flex flex-col flex-1">' +
            '<h3 class="text-base font-bold text-white mb-2 ' + c.hover + ' transition leading-snug">' +
            '<a href="' + a.url + '">' + a.title + '</a></h3>' +
            '<p class="text-slate-400 text-sm mb-3 leading-relaxed line-clamp-2">' + a.desc + '</p>' +
            '<a href="' + a.url + '" class="text-xs ' + c.link + ' transition font-semibold mt-auto">Читать →</a>' +
            '</div></article>';
    }

    fetch('/articles.json')
        .then(function (r) { return r.json(); })
        .then(function (list) {
            var related = list.filter(function (a) { return a.slug !== currentSlug; }).slice(0, 3);
            if (!related.length) return;
            el.innerHTML =
                '<div class="border-t border-slate-800 mt-16 pt-12">' +
                '<h2 class="text-2xl font-extrabold text-white mb-8">Читай также</h2>' +
                '<div class="grid md:grid-cols-3 gap-6">' +
                related.map(card).join('') +
                '</div></div>';
        })
        .catch(function () {});
})();
