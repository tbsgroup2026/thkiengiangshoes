cmake_minimum_required(VERSION 3.14)
project(tbs_core VERSION 1.0.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

option(BUILD_TESTS "Build Google Test suite for C++ core" ON)

if(POLICY CMP0135)
    cmake_policy(SET CMP0135 NEW)
endif()

include_directories(include src)

# Sources
set(CORE_SOURCES
    src/tbs_core.cpp
)

# Shared library for Android / Host
add_library(tbs_core SHARED ${CORE_SOURCES})

# Static library for iOS xcframework
add_library(tbs_core_static STATIC ${CORE_SOURCES})
set_target_properties(tbs_core_static PROPERTIES OUTPUT_NAME "tbs_core")

# Link system libraries (curl, sqlite3, pthread)
find_package(CURL QUIET)
if (CURL_FOUND)
    target_link_libraries(tbs_core PRIVATE CURL::libcurl)
    target_link_libraries(tbs_core_static PRIVATE CURL::libcurl)
endif()

find_package(SQLite3 QUIET)
if (SQLite3_FOUND)
    target_link_libraries(tbs_core PRIVATE SQLite::SQLite3)
    target_link_libraries(tbs_core_static PRIVATE SQLite::SQLite3)
endif()

# Unit Testing with Google Test
if(BUILD_TESTS)
    enable_testing()
    find_package(GTest QUIET)
    if(NOT GTest_FOUND)
        include(FetchContent)
        FetchContent_Declare(
            googletest
            URL https://github.com/google/googletest/archive/refs/tags/v1.14.0.zip
        )
        # For Windows: Prevent overriding the parent project's compiler/linker settings
        set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
        FetchContent_MakeAvailable(googletest)
    endif()

    add_executable(tbs_core_test tests/test_main.cpp ${CORE_SOURCES})
    target_link_libraries(tbs_core_test PRIVATE GTest::gtest_main)
    add_test(NAME tbs_core_test COMMAND tbs_core_test)
endif()
