if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/kashif/.gradle/caches/8.13/transforms/25020d603350d51fc8ce998e089d76a1/transformed/hermes-android-0.79.1-release/prefab/modules/libhermes/libs/android.x86/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/kashif/.gradle/caches/8.13/transforms/25020d603350d51fc8ce998e089d76a1/transformed/hermes-android-0.79.1-release/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

