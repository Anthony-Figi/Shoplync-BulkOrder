        <div class="wlp_bought">
            <table class="table table-striped table-hover wlp_bought_list" id="table_wishlist" data-id-wishlist="{$id_wishlist|escape:'htmlall':'UTF-8'}">
                <thead>
                    <tr>
                        <th class="col-xs-1 col-md-1 checkbox-col nopadding-right"></th>
                        <th class="col-xs-3 col-md-2 wishlist-product-img"></th>
                        <th class="col-xs-4 col-md-3 wishlist-product-desc">{l s='Items' mod='advansedwishlist'}</th>
                        <th class="col-xs-0 col-md-1 wishlist-product-price">{l s='Price' mod='advansedwishlist'}</th>
                        <th class="col-xs-1 col-md-1 wishlist-product-quantity">{l s='Quantity' mod='advansedwishlist'}</th>
                        <th class="col-xs-3 col-md-2 wishlist-product-priority">{l s='Priority' mod='advansedwishlist'}</th>
                        <th class="col-xs-0 col-md-2 wishlist-product-actions"></th>
                    </tr>
                </thead>
                <tbody>
                    {foreach from=$products item=product name=i}
                        <tr id="wlp_{$product.id_product|escape:'htmlall':'UTF-8'}_{$product.id_product_attribute|escape:'htmlall':'UTF-8'}">
                            <td class="col-xs-1 col-md-1 checkbox-col nopadding-right">
                                <input type="checkbox" data-available="{if (!isset($product.customization_required) || !$product.customization_required) && ($product.allow_oosp || $product.quantity > 0)}a{else}n{/if}" data-id-product="{$product.id_product|escape:'htmlall':'UTF-8'}" data-id-pa="{$product.id_product_attribute|escape:'htmlall':'UTF-8'}" name="wishlist_group" class="wishlist_group_chb" />
                            </td>
                            <td class="col-xs-3 col-md-2 wishlist-product-img">
                                <div class="product_image">
                                    <a href="{$link->getProductlink($product.id_product, $product.link_rewrite, $product.category_rewrite, null, null, null, $product.id_product_attribute)|escape:'htmlall':'UTF-8'}" title="{l s='Product detail' mod='advansedwishlist'}">
                                        <img src="{$link->getImageLink($product.link_rewrite, $product.cover, 'small_default')|escape:'htmlall':'UTF-8'}" alt="{$product.name|escape:'html':'UTF-8'}" />
                                    </a>
                                </div>
                            </td>
                            <td class="col-xs-4 col-md-3 wishlist-product-desc">
                                <div class="product_infos">
                                    <p class="product_name">{$product.name|truncate:30:'...'|escape:'html':'UTF-8'}</p>
                                    <span class="wishlist_product_detail">
                                        {if isset($product.attributes_small)}
                                            <a href="{$link->getProductlink($product.id_product, $product.link_rewrite, $product.category_rewrite, null, null, null, $product.id_product_attribute)|escape:'htmlall':'UTF-8'}" title="{l s='Product detail' mod='advansedwishlist'}">{$product.attributes_small|escape:'html':'UTF-8'}</a>
                                        {/if}
                                    </span>
                                    <span class="hidden-sm-up">{$product.price|escape:'html':'UTF-8'}</span>
                                </div>
                            </td>
                            <td class="col-xs-0 col-md-1 wishlist-product-price">
                                {$product.price|escape:'html':'UTF-8'}
                            </td>
                            <td class="col-xs-1 col-md-1 wishlist-product-quantity">
                                <input type="text" class="wl_product_qty" id="quantity_{$product.id_product|escape:'htmlall':'UTF-8'}_{$product.id_product_attribute|escape:'htmlall':'UTF-8'}" value="{$product.wl_quantity|intval}" />
                            </td>
                            <td class="col-xs-3 col-md-2 wishlist-product-priority">
                                <select id="priority_{$product.id_product|escape:'htmlall':'UTF-8'}_{$product.id_product_attribute|escape:'htmlall':'UTF-8'}">
                                    <option value="0" {if $product.priority eq 0} selected="selected" {/if}>{l s='High' mod='advansedwishlist'}</option>
                                    <option value="1" {if $product.priority eq 1} selected="selected" {/if}>{l s='Medium' mod='advansedwishlist'}</option>
                                    <option value="2" {if $product.priority eq 2} selected="selected" {/if}>{l s='Low' mod='advansedwishlist'}</option>
                                </select>
                            </td>
                            <td class="col-xs-12 col-md-2 wishlist-product-actions">
                                <div class="btn_action">
                                    {if (!isset($product.customization_required) || !$product.customization_required) && ($product.allow_oosp || $product.quantity > 0)}
                                        {if $advansedwishlistis17 == 1}
                                            <a class="btn btn-primary add_cart wishlist_add_to_cart ajax_add_to_cart_button exclusive" id="wishlist_add_to_cart_{$product.id_product|intval}" href="{$link->getAddToCartURL({$product.id_product|intval}, {$product.id_product_attribute|intval})|escape:'htmlall':'UTF-8'}" rel="nofollow" title="{l s='Add to cart' mod='advansedwishlist'}" data-id-product-attribute="{$product.id_product_attribute|intval}" data-id-product="{$product.id_product|intval}" data-minimal_quantity="{if isset($product.product_attribute_minimal_quantity) && $product.product_attribute_minimal_quantity >= 1}{$product.product_attribute_minimal_quantity|intval}{else}{$product.minimal_quantity|intval}{/if}">
                                                <span>{l s='Add to cart' mod='advansedwishlist'}</span>
                                            </a>
                                        {else}
                                            {capture}add=1&amp;id_product={$product.id_product|intval}
                                                {if isset($product.id_product_attribute) && $product.id_product_attribute}&amp;ipa={$product.id_product_attribute|intval}
                                                {/if}
                                                {if isset($static_token)}&amp;token={$static_token}
                                                {/if}
                                            {/capture}
                                            <a class="btn btn-primary wishlist_add_to_cart exclusive" href="{$link->getPageLink('cart', true, NULL, $smarty.capture.default, false)|escape:'html':'UTF-8'}" rel="nofollow" title="{l s='Add to cart' mod='advansedwishlist'}" data-id-product-attribute="{$product.id_product_attribute|intval}" data-id-product="{$product.id_product|intval}" data-minimal_quantity="{if isset($product.product_attribute_minimal_quantity) && $product.product_attribute_minimal_quantity >= 1}{$product.product_attribute_minimal_quantity|intval}{else}{$product.minimal_quantity|intval}{/if}">
                                                <span>{l s='Add to cart' mod='advansedwishlist'}</span>
                                            </a>
                                        {/if}
                                    {else}
                                        <span class="button ajax_add_to_cart_button btn btn-default disabled wishlist_add_disabled">
                                            <span>{l s='Add to cart' mod='advansedwishlist'}</span>
                                        </span>
                                    {/if}


                                    {*<a class="btn btn-primary add_cart ajax_add_to_cart_button exclusive" data-id-product-attribute="{$product.id_product_attribute|intval}" data-id-product="{$product.id_product|intval}" data-minimal_quantity="{if isset($product.product_attribute_minimal_quantity) && $product.product_attribute_minimal_quantity >= 1}{$product.product_attribute_minimal_quantity|intval}{else}{$product.wl_quantity|intval}{/if}" 
                    class="button ajax_add_to_cart_button btn btn-default" href="{$link->getPageLink('cart', true, NULL, $smarty.capture.default, false)|escape:'html':'UTF-8'}" rel="nofollow" title="{l s='Add to cart' mod='advansedwishlist'}">{l s='Add to cart' mod='advansedwishlist'}</a>*}
                                    {if $wishlists|count > 1}
                                        {l s='Move'  mod='advansedwishlist'}:
                                        {foreach name=wl from=$wishlists item=wishlist}
                                            {if $smarty.foreach.wl.first}
                                                <select class="wishlist_change_button">
                                                    <option>---</option>
                                                {/if}
                                                {if $id_wishlist != {$wishlist.id_wishlist}}
                                                    <option title="{$wishlist.name|escape:'htmlall':'UTF-8'}" value="{$wishlist.id_wishlist|escape:'htmlall':'UTF-8'}" data-id-product="{$product.id_product|escape:'htmlall':'UTF-8'}" data-id-product-attribute="{$product.id_product_attribute|escape:'htmlall':'UTF-8'}" data-quantity="{$product.wl_quantity|intval}" data-priority="{$product.priority|escape:'htmlall':'UTF-8'}" data-id-old-wishlist="{$id_wishlist|escape:'htmlall':'UTF-8'}" data-id-new-wishlist="{$wishlist.id_wishlist|escape:'htmlall':'UTF-8'}">
                                                        {l s='Move to' mod='advansedwishlist'} {$wishlist.name|escape:'htmlall':'UTF-8'}
                                                    </option>
                                                {/if}
                                                {if $smarty.foreach.wl.last}
                                                </select>
                                            {/if}
                                        {/foreach}
                                    {/if}
                                    <a href="javascript:;" class="lnksave" onclick="WishlistProductManage('wlp_{$product.id_product|escape:'htmlall':'UTF-8'}_{$product.id_product_attribute|escape:'htmlall':'UTF-8'}', 'update', '{$id_wishlist|escape:'htmlall':'UTF-8'}', '{$product.id_product|escape:'htmlall':'UTF-8'}', '{$product.id_product_attribute|escape:'htmlall':'UTF-8'}', $('#quantity_{$product.id_product|escape:'htmlall':'UTF-8'}_{$product.id_product_attribute|escape:'htmlall':'UTF-8'}').val(), $('#priority_{$product.id_product|escape:'htmlall':'UTF-8'}_{$product.id_product_attribute|escape:'htmlall':'UTF-8'}').val());" title="{l s='Save' mod='advansedwishlist'}">{l s='Save' mod='advansedwishlist'}</a>

                                    <a href="javascript:;" class="btn btn-default lnkdel" onclick="WishlistProductManage('wlp_bought', 'delete', '{$id_wishlist|escape:'htmlall':'UTF-8'}', '{$product.id_product|escape:'htmlall':'UTF-8'}', '{$product.id_product_attribute|escape:'htmlall':'UTF-8'}', $('#quantity_{$product.id_product|escape:'htmlall':'UTF-8'}_{$product.id_product_attribute|escape:'htmlall':'UTF-8'}').val(), $('#priority_{$product.id_product|escape:'htmlall':'UTF-8'}_{$product.id_product_attribute|escape:'htmlall':'UTF-8'}').val());" title="{l s='Delete' mod='advansedwishlist'}">
                                        {if $wl_custom_font == 1 || (!$wl_custom_font && $advansedwishlistis17 == 1)}
                                            <i class="material-icons">delete_forever</i>
                                        {elseif $wl_custom_font == 3}
                                            <span class="jms-arrows-remove-1"></span>
                                        {else}
                                            <i class="icon-remove"></i>
                                        {/if}
                                        {l s='Delete'  mod='advansedwishlist'}
                                    </a>
                                </div>
                            </td>
                        </tr>
                    {/foreach}
                </tbody>
                <tfoot>
                    <tr>
                        <td>{l s='Total' mod='advansedwishlist'} <span id="wish_p_total">{$total|escape:'htmlall':'UTF-8'}</span>
                            <a class="btn btn-primary add_cart wishlist_add_all_to_cart"><span>{l s='Add all to cart' mod='advansedwishlist'}</span></a>
                        </td>
                    </tr>
                </tfoot>
            </table>

            {l s='Group actions:' mod='advansedwishlist'}
            <select class="wishlist_group_actions">
                <option value="0">---</option>
                <option value="1">{l s='Delete Selected' mod='advansedwishlist'}</option>
                <option value="2">{l s='Add selected to cart' mod='advansedwishlist'}</option>
            </select>

        </div>