// Handler global para mostrar el preloader del carrito lateral según la configuración del admin
(function($) {
    'use strict';

    window.SnapSidebarCartShowPreloader = function($product) {
        if (!$product || !$product.length) return;

        var params = window.snap_sidebar_cart_params && window.snap_sidebar_cart_params.preloader ? window.snap_sidebar_cart_params.preloader : {};
        var type = params.type || 'circle';
        var position = params.position || 'center';
        var color = params.color || '#3498db';
        var color2 = params.color2 || '#e74c3c';
        var size = params.size || '40px';

        var $loader = $product.find('.snap-sidebar-cart__loader-spinner');
        $loader.attr('class', 'snap-sidebar-cart__loader-spinner');
        $loader.addClass('preloader-' + type);
        $loader.addClass('preloader-position-' + position);

        var inlineStyles = { width: size, height: size };
        if (type === 'circle') {
            inlineStyles['border-color'] = color;
            inlineStyles['border-top-color'] = color2;
        }
        $loader.css(inlineStyles);

        if (type === 'dots') {
            $loader.html('<span style="background-color:' + color + '"></span><span style="background-color:' + color + '"></span><span style="background-color:' + color + '"></span>');
        } else {
            $loader.html('');
        }

        $product.find('.snap-sidebar-cart__product-loader').show();
    };

})(jQuery); 